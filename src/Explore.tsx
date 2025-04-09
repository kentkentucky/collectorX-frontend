import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import NavBar from "./components/NavBar";
import SearchBar from "./components/SearchBar";
import { AuthContext } from "./App";

import "./Explore.css";

type category = {
  _id: string;
  name: string;
  description: string;
  image: string;
};

function Explore() {
  const authContext = useContext(AuthContext);

  const navigate = useNavigate();

  const [categories, setCategories] = useState<category[]>([]);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8080/category", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCategory = (categoryID: string) => {};

  return (
    <div className="explore-container">
      <SearchBar />
      <div className="categories-container">
        {categories &&
          categories.map((category) => (
            <div
              key={category._id}
              className="category-tile"
              onClick={() => {
                handleCategory(category._id);
              }}
            >
              <div className="image-wrapper">
                <img
                  src={category.image}
                  alt={category.name}
                  className="category-image"
                />
                <div className="overlay"></div>
                <h3 className="category-name">{category.name}</h3>
              </div>
            </div>
          ))}
      </div>
      <NavBar />
    </div>
  );
}

export default Explore;
