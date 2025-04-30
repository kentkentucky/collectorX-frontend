import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Carousel from "react-multi-carousel";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { IonIcon } from "@ionic/react";
import { heart } from "ionicons/icons";

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

type Listing = {
  _id: string;
  name: string;
  price: number;
  images: string[];
  condition: {
    _id: string;
    name: string;
  };
  createdAt: Date;
  likes: number;
};

type Favourite = {
  _id: string;
  listingID: string;
};

function Home() {
  const authContext = useContext(AuthContext);

  const navigate = useNavigate();

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);

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
        setListings(response.data.listings);
        setFavourites(
          response.data.favourites.map(
            (favourite: Favourite) => favourite.listingID
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleListing = (listingID: string) => {
    navigate(`/listing/${listingID}`);
  };

  const handleFavourite = async (
    e: React.MouseEvent<HTMLIonIconElement>,
    listingID: string
  ) => {
    e.stopPropagation();
    try {
      const response = await axios.post(
        "http://localhost:8080/favourites",
        { listingID },
        {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        }
      );
      if (response.status == 200) {
        // Update the favourites state
        setFavourites((prevFavourites) => {
          if (prevFavourites.includes(listingID)) {
            // Remove from favourites
            return prevFavourites.filter((id) => id !== listingID);
          } else {
            // Add to favourites
            return [...prevFavourites, listingID];
          }
        });
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
      <div className="home-listings-container">
        <h2 className="listings-header">For You</h2>
        <div className="home-listings">
          {listings.map((listing) => (
            <div
              className="home-listing-card"
              key={listing._id}
              onClick={() => {
                handleListing(listing._id);
              }}
            >
              <div className="card-image-wrapper">
                <img src={listing.images?.[0]} className="card-image" />
                <div className="listing-duration-overlay">
                  {listing.createdAt
                    ? formatDistanceToNow(listing.createdAt, {
                        addSuffix: true,
                      })
                    : "Unknown"}
                </div>
              </div>
              <div className="card-details">
                <div className="card-meta">
                  <p className="home-listing-name">{listing.name}</p>
                  <p className="home-listing-price">S${listing.price}</p>
                  <p className="home-listing-condition">
                    {listing.condition.name}
                  </p>
                </div>
                <div className="likes-container">
                  <IonIcon
                    icon={heart}
                    className={`home-heart-icon ${
                      favourites.includes(listing._id) ? "active" : ""
                    }`}
                    onClick={(e) => {
                      handleFavourite(e, listing._id);
                    }}
                  />
                  <p className="likes-number">{listing.likes}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <NavBar />
    </div>
  );
}

export default Home;
