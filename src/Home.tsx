import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Carousel from "react-multi-carousel";

import NavBar from "./components/NavBar";
import SearchBar from "./components/SearchBar";
import { AuthContext } from "./App";

import "./Home.css";
import "react-multi-carousel/lib/styles.css";

const responsive = {
  mobile: {
    breakpoint: { max: 430, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

type Advertisement = {
  _id: string;
  name: string;
  image: string;
};

function Home() {
  const authContext = useContext(AuthContext);

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);

  useEffect(() => {
    getHome();
  }, []);

  const getHome = async () => {
    try {
      const response = await axios.get("http://localhost:8080/home", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setAdvertisements(response.data.advertisements);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="home-container">
      <SearchBar />
      <Carousel
        swipeable={false}
        draggable={false}
        showDots={true}
        responsive={responsive}
        ssr={true} // means to render carousel on server-side.
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
        customTransition="all .5"
        transitionDuration={500}
        containerClass="carousel-container"
        removeArrowOnDeviceType={["mobile"]}
        dotListClass="custom-dot-list-style"
        itemClass="carousel-item-padding-40-px"
      >
        {advertisements &&
          advertisements.map((advertisement) => (
            <div className="item-container" key={advertisement._id}>
              <div className="carousel-img">
                <img src={advertisement.image} className="carousel-img"></img>
              </div>
            </div>
          ))}
      </Carousel>
      <NavBar />
    </div>
  );
}

export default Home;
