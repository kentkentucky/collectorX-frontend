import { useParams, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import Carousel from "react-multi-carousel";
import {
  IonButton,
  IonIcon,
  IonFab,
  IonModal,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonContent,
  IonItem,
  IonInput,
} from "@ionic/react";
import { arrowBack, heart, star, trash, create } from "ionicons/icons";
import { formatDistanceToNow } from "date-fns";
import { useAuth0 } from "@auth0/auth0-react";

import { AuthContext } from "./App";

import "./Listing.css";
import "react-multi-carousel/lib/styles.css";

const responsive = {
  mobile: {
    breakpoint: { max: 430, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

type Listing = {
  _id?: string;
  name?: string;
  description?: string;
  dealMethod?: string;
  location?: string;
  price?: number;
  condition?: {
    _id: string;
    name: string;
  };
  images?: string[];
  createdAt?: Date;
  likes?: number;
  userID?: {
    _id: string;
    username: string;
    image: string;
    reviews: {
      rating: number;
    }[];
    isSold: boolean;
    createdAt: string;
  };
};

function Listing() {
  const modal = useRef<HTMLIonModalElement>(null);
  const input = useRef<HTMLIonInputElement>(null);

  const { user } = useAuth0();

  const authContext = useContext(AuthContext);

  const { listingID } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing>({});
  const [accountDuration, setAccountDuration] = useState<string>("");
  const [averageRating, setAverageRating] = useState<string | null>(null);

  useEffect(() => {
    getListing();
  }, []);

  useEffect(() => {
    if (listing.userID?.createdAt) {
      calculateAccountDuration(listing.userID.createdAt);
    }
  }, [listing.userID]);

  useEffect(() => {
    if (listing.userID?.reviews) {
      setAverageRating(calculateAverageRating());
    }
  }, [listing.userID?.reviews]);

  const getListing = async () => {
    try {
      const response = await axios.get("http://localhost:8080/listing", {
        params: { listingID },
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setListing(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const calculateAccountDuration = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const diffInMs = currentDate.getTime() - createdDate.getTime();

    // Convert milliseconds to days, months, and years
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths =
      currentDate.getMonth() -
      createdDate.getMonth() +
      (currentDate.getFullYear() - createdDate.getFullYear()) * 12;
    const diffInYears = Math.floor(diffInMonths / 12);

    // Determine what to display
    if (diffInDays < 30) {
      setAccountDuration(`${diffInDays} day${diffInDays === 1 ? "" : "s"}`);
    } else if (diffInMonths < 12) {
      setAccountDuration(
        `${diffInMonths} month${diffInMonths === 1 ? "" : "s"}`
      );
    } else {
      setAccountDuration(`${diffInYears} year${diffInYears === 1 ? "" : "s"}`);
    }
  };

  const calculateAverageRating = () => {
    if (!listing.userID?.reviews || listing.userID.reviews.length === 0) {
      return null; // Handle case with no reviews
    }

    const totalRating = listing.userID.reviews.reduce((sum, review) => {
      return sum + (review.rating || 0); // Add the rating, default to 0 if missing
    }, 0);

    const averageRating = totalRating / listing.userID.reviews.length;
    return averageRating.toFixed(2);
  };

  const handleDelete = async (listingID: string) => {
    try {
      const response = await axios.delete("http://localhost:8080/listing", {
        params: { listingID },
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response.status == 200) {
        navigate("/profile");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const confirm = async () => {
    const offer = input.current?.value;

    if (!offer) return;

    try {
      const response = await axios.post(
        "http://localhost:8080/offer/create",
        {
          listingID: listing._id,
          sellerID: listing.userID?._id,
          offer,
        },
        {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        }
      );

      if (response.status == 200) {
        modal.current?.dismiss(offer, "confirm");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChat = async (sellerID: string) => {
    try {
      const response = await axios.get("http://localhost:8080/chat/toggle", {
        params: { sellerID },
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        navigate(`/chat/${response.data.chatID}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="listing-container">
      <IonFab
        slot="fixed"
        vertical="top"
        horizontal="start"
        onClick={handleBack}
      >
        <IonIcon icon={arrowBack} className="listing-arrow-back-icon" />
      </IonFab>
      {user?.sub?.slice(6) === listing.userID?._id ? (
        <IonFab slot="fixed" vertical="top" horizontal="end">
          <IonIcon
            icon={create}
            className="listing-edit-icon"
            onClick={() => {
              navigate("edit");
            }}
          />
          <IonIcon
            icon={trash}
            className="listing-trash-icon"
            onClick={() => {
              if (listing._id) {
                handleDelete(listing._id);
              } else {
                console.error("Error: listing._id is undefined");
              }
            }}
          />
        </IonFab>
      ) : null}
      {listing.images && listing.images.length > 1 ? (
        <Carousel
          swipeable={true}
          draggable={false}
          showDots={true}
          responsive={responsive}
          ssr={true} // means to render carousel on server-side.
          infinite={true}
          autoPlay={false}
          autoPlaySpeed={3000}
          keyBoardControl={true}
          customTransition="all .5"
          transitionDuration={500}
          containerClass="listing-carousel-container"
          removeArrowOnDeviceType={["mobile"]}
          dotListClass="custom-dot-list-style"
          itemClass="carousel-item-padding-40-px"
        >
          {listing.images.map((image, index) => (
            <div className="listing-item-container" key={index}>
              <div className="listing-carousel-img">
                <img
                  src={image}
                  className="listing-carousel-img"
                  alt={`Listing ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </Carousel>
      ) : (
        listing.images &&
        listing.images.length === 1 && (
          <div className="listing-item-container">
            <div className="listing-carousel-img">
              <img
                src={listing.images[0]}
                className="listing-carousel-img"
                alt="Listing"
              />
            </div>
          </div>
        )
      )}
      <div className="listing-meta">
        <h1 className="listing-name">{listing.name}</h1>
        <p className="listing-price">S${listing.price}</p>
        <p className="listing-header">Details</p>
        <p className="listing-text">Condition: {listing.condition?.name}</p>
        <p className="listing-text">
          Listed:{" "}
          {listing.createdAt
            ? formatDistanceToNow(listing.createdAt, {
                addSuffix: true,
              })
            : "Unknown"}
        </p>
        <p className="listing-header">Description</p>
        <p className="listing-text">{listing.description}</p>
        <p className="listing-header">Deal Method</p>
        <p className="listing-text">
          {listing.dealMethod
            ? listing.dealMethod.charAt(0).toUpperCase() +
              listing.dealMethod.slice(1)
            : "Unknown"}
        </p>
        {listing.dealMethod === "meetup" ||
          (listing.dealMethod === "either" && (
            <p className="listing">Location: {listing.location}</p>
          ))}
      </div>
      <div className="seller-meta">
        <h2 className="seller-header">About this seller</h2>
        <div className="seller-details-container">
          <div className="seller-image-wrapper">
            {listing.userID?.image ? (
              <img
                src={listing.userID.image}
                className="seller-image"
                alt="user profile"
              />
            ) : (
              <div className="seller-placeholder">
                {listing.userID?.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <p className="username">@{listing.userID?.username}</p>
          <div className="seller-bottom-section">
            <div className="seller-reviews">
              {calculateAverageRating() ? (
                <div className="average-rating">
                  <p>{averageRating}</p>
                  <IonIcon icon={star} className="star-icon" />
                  <p className="review-count">
                    {listing.userID?.reviews?.length} reviews
                  </p>
                </div>
              ) : (
                <p className="review-count">No reviews yet</p>
              )}
            </div>
            <div className="account-duration">
              <p className="duration">{accountDuration}</p>
              <p className="duration-bottom-text">on CollectorX</p>
            </div>
          </div>
        </div>
      </div>
      <div className="listing-actions-container">
        <div className="likes-container">
          <IonIcon icon={heart} className="listing-heart-icon" />
          <p className="likes-number">{listing.likes}</p>
        </div>
        {user?.sub?.slice(6) === listing.userID?._id ? (
          <>
            <IonButton id="insight" className="action-btn">
              View Insights
            </IonButton>
            <IonButton id="chat" className="action-btn">
              Chats
            </IonButton>
          </>
        ) : (
          <>
            <IonButton id="offer" className="action-btn">
              Offer
            </IonButton>
            <IonButton
              id="checkout"
              className="action-btn"
              onClick={() => {
                navigate("checkout");
              }}
            >
              Checkout
            </IonButton>
            <IonButton
              id="chat"
              className="action-btn"
              onClick={() => {
                if (listing?.userID?._id) {
                  handleChat(listing.userID._id);
                }
              }}
            >
              Chat
            </IonButton>
          </>
        )}
      </div>
      <IonModal ref={modal} trigger="offer">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => modal.current?.dismiss()}>
                Cancel
              </IonButton>
            </IonButtons>
            <IonTitle>Offer</IonTitle>
            <IonButtons slot="end">
              <IonButton strong={true} onClick={() => confirm()}>
                Confirm
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonInput
              label="Enter the amount"
              labelPlacement="stacked"
              ref={input}
              type="number"
              placeholder={listing.price?.toString()}
              className="offer-input"
            />
          </IonItem>
        </IonContent>
      </IonModal>
    </div>
  );
}

export default Listing;
