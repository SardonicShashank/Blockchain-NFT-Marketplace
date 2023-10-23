import React, {useState, useEffect, useContext} from "react";
import Image from "next/image";

//INTERNAL IMPORT
import Style from "./HeroSection.module.css";
import { Button } from "../componentsindex";
import images from "../../img";
import { useRouter } from "next/router";

//SMART CONTRACT IMPORT
import { NFTMarketplaceContext } from "../../Context/NFTMarketplaceContext";

const HeroSection = () => {
  
  const { titleData } = useContext(NFTMarketplaceContext);
  const router = useRouter();
  return (
    <div className={Style.heroSection}>
      <div className={Style.heroSection_box}>
        <div className={Style.heroSection_box_left}>
          <h1> { titleData } 🖼️</h1>
          {/* <p>
            Discover the most outstanding NTFs in all topics of life. Creative
            your NTFs and sell them
          </p> */}
          <p>
            Every art is something amazing find it and collect it into NFT for you be the only owner of a good work.
          </p>
          <Button 
            btnName="Start your search" 
            handleClick={() => router.push("/collection")} 
          />
        </div>
        <div className={Style.heroSection_box_right}>
          <Image
            src={images.hero}
            alt="Hero section"
            width={500}
            height={500}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
