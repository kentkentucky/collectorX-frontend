import { Settings, Star } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import axios from "axios";

import NavBar from "./components/NavBar";
import { AuthContext } from "./App";
import background from "./assets/blue background.jpg";

import "./Profile.css";

type ProfileType = {
  _id?: string;
  username?: string;
  createdAt?: string;
  image?: string;
  reviews?: {
    rating: number;
  }[];
};

function Profile() {
  const authContext = useContext(AuthContext);

  const [profile, setProfile] = useState<ProfileType>({});
  const [accountDuration, setAccountDuration] = useState<string>("");
  const [averageRating, setAverageRating] = useState<string | null>(null);

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
        <Settings className="settings-icon" />
      </div>
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
                <Star className="star-icon" />
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
            <p className="collectorX">on CollectorX</p>
          </div>
        </div>
      </div>
      <div className="actions-hub"></div>
      <NavBar />
    </div>
  );
}

export default Profile;
