import {
  IonIcon,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonModal,
  IonList,
  IonItem,
  createAnimation,
} from "@ionic/react";
import {
  settingsOutline,
  star,
  heart,
  receipt,
  pricetag,
  hammer,
  logOut,
  arrowForward,
} from "ionicons/icons";
import { useAuth0 } from "@auth0/auth0-react";
import { Browser } from "@capacitor/browser";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useNavigate, Link } from "react-router-dom";

import NavBar from "./components/NavBar";
import { AuthContext } from "./App";
import background from "./assets/blue background.jpg";

import "./Profile.css";

const logoutUri = import.meta.env.VITE_AUTH0_URI;

type ProfileType = {
  _id?: string;
  username?: string;
  createdAt?: string;
  image?: string;
  reviews?: {
    rating: number;
  }[];
  listings?: {
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
  }[];
};

function Profile() {
  const authContext = useContext(AuthContext);

  const { logout } = useAuth0();

  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileType>({});
  const [accountDuration, setAccountDuration] = useState<string>("");
  const [averageRating, setAverageRating] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { name: "Watchlist", icon: heart, path: "/favourites" },
    { name: "Purchases", icon: receipt, path: "/favourites" },
    { name: "Sales", icon: pricetag, path: "/favourites" },
    { name: "Bids & Offers", icon: hammer, path: "/favourites" },
  ];

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (profile.createdAt) {
      calculateAccountDuration(profile.createdAt);
    }
  }, [profile]);

  useEffect(() => {
    if (profile.reviews) {
      setAverageRating(calculateAverageRating());
    }
  }, [profile.reviews]);

  const getProfile = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user/profile", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error(error);
    }
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
    if (!profile.reviews || profile.reviews.length === 0) {
      return null; // Handle case with no reviews
    }

    const totalRating = profile.reviews.reduce((sum, review) => {
      return sum + (review.rating || 0); // Add the rating, default to 0 if missing
    }, 0);

    const averageRating = totalRating / profile.reviews.length;
    return averageRating.toFixed(2);
  };

  const doLogout = async () => {
    await logout({
      logoutParams: {
        returnTo: logoutUri,
      },
      async openUrl(url) {
        // Redirect using Capacitor's Browser plugin
        await Browser.open({
          url,
          windowName: "_self",
        });
      },
    });
    window.location.href = "/";
  };

  const enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = createAnimation()
      .addElement(root?.querySelector("ion-backdrop")!)
      .fromTo("opacity", "0.01", "var(--backdrop-opacity)");

    const wrapperAnimation = createAnimation()
      .addElement(root?.querySelector(".modal-wrapper")!)
      .fromTo("transform", "translateX(100%)", "translateX(0%)")
      .fromTo("opacity", "0.1", "1");

    return createAnimation()
      .addElement(baseEl)
      .easing("ease-out")
      .duration(300)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  const leaveAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = createAnimation()
      .addElement(root?.querySelector("ion-backdrop")!)
      .fromTo("opacity", "var(--backdrop-opacity)", "0");

    const wrapperAnimation = createAnimation()
      .addElement(root?.querySelector(".modal-wrapper")!)
      .fromTo("transform", "translateX(0%)", "translateX(100%)")
      .fromTo("opacity", "1", "0");

    return createAnimation()
      .addElement(baseEl)
      .easing("ease-in")
      .duration(300)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  const handleListing = (listingID: string) => {
    navigate(`/listing/${listingID}`);
  };

  return (
    <div className="profile-container">
      <div className="background-container">
        <img
          src={background}
          alt="blue abstract image"
          className="background-image"
        />
      </div>
      <div className="actions-container">
        <IonIcon
          icon={settingsOutline}
          className="settings-icon"
          onClick={() => setIsOpen(true)}
        />
      </div>
      <IonModal
        isOpen={isOpen}
        id="settings-modal"
        enterAnimation={enterAnimation}
        leaveAnimation={leaveAnimation}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle className="settings-title">Settings</IonTitle>
            <IonButtons slot="start">
              <IonButton onClick={() => setIsOpen(false)}>
                <IonIcon icon={arrowForward} className="arrow-forward-icon" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            <IonItem className="settings-item">Edit Profile</IonItem>
            <IonItem className="settings-item" onClick={doLogout}>
              <div className="logout-item">
                <IonIcon icon={logOut} slot="start" className="logout-icon" />
                Log Out
              </div>
            </IonItem>
          </IonList>
        </IonContent>
      </IonModal>
      <div className="user-details-container">
        <div className="user-top-section">
          <div className="user-image-wrapper">
            {profile.image ? (
              <img
                src={profile.image}
                className="profile-user-image"
                alt="user profile"
              />
            ) : (
              <div className="profile-user-placeholder">
                {profile.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <p className="username">@{profile.username}</p>
        </div>
        <div className="user-bottom-section">
          <div className="user-reviews">
            {calculateAverageRating() ? (
              <div className="average-rating">
                <p>{averageRating}</p>
                <IonIcon icon={star} className="star-icon" />
                <p className="review-count">
                  {profile.reviews?.length} reviews
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
      <div className="user-actions-hub">
        {actions.map((action, index) => (
          <Link to={action.path} className="action-link" key={index}>
            <IonIcon icon={action.icon} className="action-icon" />
            <p className="action-name">{action.name}</p>
          </Link>
        ))}
      </div>
      <div className="user-listings-container">
        <h2 className="listings-header">Listings</h2>
        <div className="profile-listings">
          {profile.listings?.map((listing) => (
            <div
              className="profile-listing-card"
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
                  <p className="profile-listing-name">{listing.name}</p>
                  <p className="profile-listing-price">S${listing.price}</p>
                  <p className="profile-listing-condition">
                    {listing.condition.name}
                  </p>
                </div>
                <div className="likes-container">
                  <IonIcon icon={heart} className="heart-icon" />
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

export default Profile;
