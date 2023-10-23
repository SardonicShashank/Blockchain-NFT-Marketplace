// import React from "react";

// //INTERNAL IMPORT
// import Style from "../styles/collection.module.css";
// import images from "../img";
// import {
//   Banner,
//   CollectionProfile,
//   NFTCardTwo,
// } from "../collectionPage/collectionIndex";
// import { Slider, Brand } from "../components/componentsindex";
// import Filter from "../components/Filter/Filter";

// const collection = () => {
//   const collectionArray = [
//     images.nft_image_1,
//     images.nft_image_2,
//     images.nft_image_3,
//     images.nft_image_1,
//     images.nft_image_2,
//     images.nft_image_3,
//     images.nft_image_1,
//     images.nft_image_2,
//   ];
//   return (
//     <div className={Style.collection}>
//       <Banner bannerImage={images.creatorbackground1} />
//       <CollectionProfile />
//       <Filter />
//       <NFTCardTwo NFTData={collectionArray} />

//       <Slider />
//       <Brand />
//     </div>
//   );
// };

// export default collection;

import React, { useState, useEffect, useContext } from "react";

//INTRNAL IMPORT
import Style from "../styles/searchPage.module.css";
import { Slider, Brand, Loader } from "../components/componentsindex";
import { SearchBar } from "../SearchPage/searchBarIndex";
import { Filter } from "../components/componentsindex";

import { NFTCardTwo, Banner } from "../collectionPage/collectionIndex";
import images from "../img";

//SMART CONTRACT IMPORT
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const searchPage = () => {

  const { fetchNFTs, setError, currentAccount } = useContext(NFTMarketplaceContext);
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);


  try {
    if(currentAccount) {
      fetchNFTs().then((items) => {
        setNfts(items.reverse());
        setNftsCopy(items);
        console.log(nfts);
      });
    }
  } catch (error) {
    setError("Please reload the browser");
  }
  
  const onHandleSearch = (value) => {
    const filterdNFTS = nfts.filter(({name}) => 
      name.toLowerCase().includes(value.toLowerCase())
    );

    if(filterdNFTS.length === 0) {
      setNfts(nftsCopy );
    } else {
      setNfts(filterdNFTS);
    }
  };

  const onClearSearch = () => {
    if(nfts.length && nftsCopy.length) {
      setNfts(nftsCopy);
    }
  };

  // const collectionArray = [
  //   images.nft_image_1,
  //   images.nft_image_2,
  //   images.nft_image_3,
  //   images.nft_image_1,
  //   images.nft_image_2,
  //   images.nft_image_3,
  //   images.nft_image_1,
  //   images.nft_image_2,
  // ];
  return (
    <div className={Style.searchPage}>
      <Banner bannerImage={images.creatorbackground2} />
      <SearchBar 
        onHandleSearch={onHandleSearch} 
        onClearSearch={onClearSearch}
      />
      {/* <Filter /> */}
      {nfts.length == 0 ? <Loader /> : <NFTCardTwo NFTData={nfts} /> }
      {/* <Slider />
      <Brand /> */}
    </div>
  );
};

export default searchPage;
