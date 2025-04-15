import { useState, createContext } from "react";
import { close } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import { useNavigate } from "react-router-dom";

import ProductDetailsForm from "./components/ProductDetailsForm";
import ListingDetailsForm from "./components/ListingDetailsForm";

import "./List.css";

interface Listing {
  name: string;
  description: string;
  category: string;
  price: number | null;
  condition: string;
  size: string;
  dealMethod: string;
  location: string;
  images: string[];
}

interface ListingProviderType {
  listingDetails: Listing;
  setListingDetails: React.Dispatch<React.SetStateAction<Listing>>;
}

export const ListingContext = createContext<ListingProviderType>({
  listingDetails: {
    name: "",
    description: "",
    category: "",
    price: null,
    condition: "",
    size: "",
    dealMethod: "",
    location: "",
    images: [],
  },
  setListingDetails: () => {},
});

interface StageProviderType {
  listingStage: number;
  setListingStage: React.Dispatch<React.SetStateAction<number>>;
}

export const StageContext = createContext<StageProviderType>({
  listingStage: 1,
  setListingStage: () => {},
});

function List() {
  const navigate = useNavigate();

  const [listingStage, setListingStage] = useState(1);
  const [listingDetails, setListingDetails] = useState<Listing>({
    name: "",
    description: "",
    category: "",
    price: null,
    condition: "",
    size: "",
    dealMethod: "",
    location: "",
    images: [],
  });

  const handleClose = () => {
    navigate(-1);
  };

  const renderForm = () => {
    if (listingStage == 1) return <ProductDetailsForm />;
    if (listingStage == 2) return <ListingDetailsForm />;
  };

  return (
    <div className="list-container">
      <IonIcon icon={close} className="close-icon" onClick={handleClose} />
      <StageContext.Provider value={{ listingStage, setListingStage }}>
        <ListingContext.Provider value={{ listingDetails, setListingDetails }}>
          {renderForm()}
        </ListingContext.Provider>
      </StageContext.Provider>
    </div>
  );
}

export default List;
