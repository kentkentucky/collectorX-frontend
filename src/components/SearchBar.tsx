import { IonIcon } from "@ionic/react";
import { hammer, close } from "ionicons/icons";
import { IonSearchbar } from "@ionic/react";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import {
  UNSAFE_getPatchRoutesOnNavigationFunction,
  useNavigate,
} from "react-router-dom";

import { AuthContext } from "../App";

import "./SearchBar.css";

type Results = {
  listings: Array<{ _id: string; name: string }>;
  categories: Array<{ _id: string; name: string }>;
  users: Array<{ _id: string; username: string }>;
};

type Recent = {
  _id: string;
  referenceID: {
    name: string;
  };
};

function SearchBar() {
  const authContext = useContext(AuthContext);

  const navigate = useNavigate();

  const [results, setResults] = useState<Results>({
    listings: [],
    categories: [],
    users: [],
  });
  const [focused, setFocused] = useState(false);
  const [recents, setRecents] = useState<Recent[]>([]);
  const [offers, setOffers] = useState(0);

  useEffect(() => {
    getOffers();
  }, []);

  const getOffers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/offer/count", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setOffers(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInput = (e: CustomEvent) => {
    let query = e.detail.value;

    if (!query || query.trim() === "") {
      setResults({
        listings: [],
        categories: [],
        users: [],
      });
      return;
    }

    fetchSearch(query);
  };

  const fetchSearch = async (search: string) => {
    try {
      const response = await axios.get("http://localhost:8080/search", {
        params: { search },
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setResults(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFocus = async () => {
    setFocused(true);
    try {
      const response = await axios.get("http://localhost:8080/search/recents", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setRecents(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClass = async (classID: string) => {
    const type = "Class";
    try {
      const response = await axios.post(
        "http://localhost:8080/search",
        { classID, type },
        {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        }
      );
      if (response) {
        navigate(`/class/${classID}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCategory = async (categoryID: string) => {
    const type = "Category";
    try {
      const response = await axios.post(
        "http://localhost:8080/search",
        { categoryID, type },
        {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        }
      );
      if (response) {
        navigate(`/category/${categoryID}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUser = async (userID: string) => {
    const type = "User";
    try {
      const response = await axios.post(
        "http://localhost:8080/search",
        { userID, type },
        {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        }
      );
      if (response) {
        console.log(response);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const removeSearch = async (index: number, recentID: string) => {
    try {
      const response = await axios.delete(
        "http://localhost:8080/search/recents",
        {
          params: { recentID },
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        }
      );
      if (response) {
        setRecents(recents.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOffer = () => {
    navigate("/offers");
  };

  return (
    <div className="search-container">
      <div className="searchbar-container">
        <IonSearchbar
          className="searchbar"
          showCancelButton="focus"
          debounce={500}
          onIonInput={(e) => handleInput(e)}
          onIonFocus={handleFocus}
          onIonCancel={() => {
            setFocused(false);
            setResults({
              listings: [],
              categories: [],
              users: [],
            });
          }}
        ></IonSearchbar>
        {!focused && (
          <div className="hammer-wrapper">
            <IonIcon
              icon={hammer}
              className="hammer-icon"
              onClick={handleOffer}
            />
            {offers > 0 && <div className="offer-badge">{offers}</div>}
          </div>
        )}
      </div>
      {focused &&
        (results.listings.length +
          results.categories.length +
          results.users.length >
        0 ? (
          <div className="search-overlay">
            <div className="search-list">
              {results.listings.map((listing) => (
                <div
                  key={listing._id}
                  className="search-item"
                  onClick={() => {
                    handleClass(listing._id);
                  }}
                >
                  <div className="search-term">{listing.name}</div>
                </div>
              ))}
              {results.categories.map((category) => (
                <li
                  key={category._id}
                  className="search-item"
                  onClick={() => {
                    handleCategory(category._id);
                  }}
                >
                  <div className="search-term">{category.name}</div>
                </li>
              ))}
              {results.users.map((user) => (
                <li
                  key={user._id}
                  className="search-item"
                  onClick={() => {
                    handleUser(user._id);
                  }}
                >
                  <div className="search-term">{user.username}</div>
                </li>
              ))}
            </div>
          </div>
        ) : (
          <div className="search-overlay">
            <div className="search-list">
              <h1 className="recent-title">Recent Searches</h1>
              {recents?.map((recent, index) => (
                <div key={index} className="search-item">
                  <div className="search-term">{recent.referenceID.name}</div>
                  <IonIcon
                    icon={close}
                    onClick={() => {
                      removeSearch(index, recent._id);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

export default SearchBar;
