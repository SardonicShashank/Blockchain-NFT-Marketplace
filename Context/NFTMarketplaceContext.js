import React, { useState, useEffect, useContext } from 'react';
import Wenb3Modal from "web3modal";
import { ethers } from 'ethers';
import {useRouter} from 'next/router';
import axios from 'axios';
import { create as ipfsHttpClient } from "ipfs-http-client";

//const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const projectId = "YOUR PROJECT ID";
const projectSecretKey = "YOUR PRIVATE SECRET KEY";
const auth = `Basic ${Buffer.from(`${projectId}:${projectSecretKey}`).toString(
    "base64"
)}`;
const subdomain = "YOUR SUB-DOMAIN";

const client =ipfsHttpClient({
    host: "infura-ipfs.io",
    port: 5001,
    protocol: "https",
    headers: {
        authorization: auth,
    },
});

//INTERNAL IMPORT 
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "./constants";

//---FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) => 
    new ethers.Contract(
        NFTMarketplaceAddress,
        NFTMarketplaceABI,
        signerOrProvider
    ); 

    //---CONNECTING WITH SMART CONTRACT

    const connectingWithSmartContract = async() => {
        try {
            const web3Modal = new Wenb3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner()
            const contract = fetchContract(signer);
            return contract;
        } catch (error) {
            console.log("Something went wrong while connecting with contract");
        }
    };

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = ({ children }) => {
    const titleData = "Discover unique and incredible rare digital arts";
    // const titleData = "Discover, collect, and sell NFTs";

    //----USESTATE 
    const [error, setError] = useState();
    const [openError, setOpenError] = useState();
    const [currentAccount, setCurrentAccount] = useState("");
    const router = useRouter();

    //---CHECK IF WALLET IS CONNECTED
    const checkIfWalletConnected = async () => {
        try {
            if(!window.ethereum) 
                return setOpenError(true), setError("Install MetaMask");

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });

            if(accounts.length) {
                setCurrentAccount(accounts[0]);
            } else {
                setOpenError(true),
                setError("No Account Found");
            }
        } catch (error) {
            setOpenError(true),
            setError("Something wrong while connecting to wallet");
        }
    };
     
    useEffect (() => {
        checkIfWalletConnected();
    }, []);

    //----CONNECT WALLET FUNCTION
    const connectWallet = async() => {
        try {
            if(!window.ethereum) 
                return (
                    setOpenError(true), 
                    setError("Install MetaMask")
                )

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            setCurrentAccount(accounts[0]);
            // window.location.reload();
        } catch (error) {
            setOpenError(true),
            setError("Error while connecting to wallet");
        }
    };

    //---UPLOAD TO IPFS FUNCTION
    const uploadToIPFS = async(file) => {
        try {
            const added = await client.add({content: file});
            const url = `${subdomain}/ipfs/${added.path}`;
            return url;
        } catch (error) {
            setOpenError(true),
            setError("Error Uploading to IPFS", (error));
        }
    };

    //---CREATE NFT FUNCTION 
    const createNFT = async(name, price, image, description, router) => {
        if( !name || !description || !price || !image )
            return setOpenError(true), setError("Data is missing");

        const data = JSON.stringify({name, description, image})

        try {
            const added = await client.add(data);

            const url = `${subdomain}/ipfs/${added.path}`;

            await createSale(url, price);
            router.push('/searchPage');
        } catch (error) {
            setOpenError(true),
            setError(error);
        }
    };

    //---CREATE SALE FUNCTION 
    const createSale = async(url, formInputPrice, isReselling, id) => {
        try {
            const price = ethers.utils.parseUnits(formInputPrice, "ether");
            const contract =await connectingWithSmartContract();

            const listingPrice = await contract.getListingPrice();

            const transaction = !isReselling 
                ? await contract.createToken(url, price, {
                    value: listingPrice.toString(),
                }) 
                : await contract.resellToken(id, price, {
                    value: listingPrice.toString(),
                });

                await transaction.wait();

                console.log(transaction);
        } catch (error) {
            setOpenError(true),
            setError("Error while creating sale", error);
        }
    };

    //---FETCHNFT FUCNTION
    const fetchNFTs = async() => {
        try {

            // if(currentAccount){
            //     const provider = new ethers.providers.JsonRpcProvider(
            //         "https://"
            //     );
            // }
            // console.log(provider);

            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);

            const data = await contract.fetchMarketItems();


            const items = await Promise.all(
                data.map(async({tokenId, seller, owner, price: unformattedPrice}) => {
                    const tokenURI = await contract.tokenURI(tokenId);

                    const {
                        data: {image, name, description},
                    } = await axios.get(tokenURI);
                    const price = ethers.utils.formatUnits(
                        unformattedPrice.toString(),
                        "ether"
                    );

                    return {
                        price,
                        tokenId: tokenId.toNumber(),
                        seller,
                        owner,
                        image, 
                        name, 
                        description,
                        tokenURI,
                    };
                }
                )
            );
            return items;

        } catch (error) {
            setOpenError(true),
            setError("error while fetching NFTs", error);
        }
    };

    useEffect(() => {
        fetchNFTs();
    }, [])

    //---FETCHING MY NFT OR LISTED NFTs
    const fetchMyNFTsOrListedNFTs = async(type) => {
        try {
            const contract = await connectingWithSmartContract();

            const data = 
                type == "fetchItemsListed" 
                    ? await contract.fetchItemsListed() 
                    : await contract.fetchMyNFTs();

                const items = await Promise.all(
                    data.map(async({tokenId, seller, owner, price: unformattedPrice}) => {
                        const tokenURI = await contract.tokenURI(tokenId);
                        const {
                            data: {image, name, description},
                        } = await axios.get(tokenURI);
                        const price = ethers.utils.formatUnits(
                            unformattedPrice.toString(),
                            "ether"
                        );

                        return {
                            price,
                            tokenId: tokenId.toNumber(),
                            seller,
                            owner,
                            image,
                            name, 
                            description,
                            tokenURI,
                        }
                    }
                    )
                );
                return items;
        } catch (error) {
            setOpenError(true),
            setError("Error while fetching listed NFTs")
        }
    };

    useEffect(() => {
        fetchMyNFTsOrListedNFTs();
    }, []);

    //---BUT NFTs FUNCTION
    const buyNFT = async(nft) => {
        try {
            const contract = await connectingWithSmartContract();
            const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

            const transaction = await contract.createMarketSale(nft.tokenId, {
                value: price,
            });

            await transaction.wait();
            router.push("/author");
        } catch (error) {
            console.log("Error while buying NFT")
        }
    }
    return (
        <NFTMarketplaceContext.Provider 
            value={{ 
                checkIfWalletConnected,
                connectWallet,
                uploadToIPFS,
                createNFT,
                fetchNFTs,
                fetchMyNFTsOrListedNFTs,
                buyNFT,
                createSale,
                currentAccount,
                titleData, 
                setOpenError,
                setError,
                openError,
                error,
            }} 
        >
            {children}
        </NFTMarketplaceContext.Provider>
    );
};