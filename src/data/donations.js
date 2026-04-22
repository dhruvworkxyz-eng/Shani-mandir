import liftImage from "../images/\u0932\u093f\u092b\u094d\u091f \u0928\u093f\u0930\u094d\u092e\u093e\u0923 \u0921\u094b\u0928\u0947\u0936\u0928.jpg";
import stairsImage from "../images/\u0938\u0940\u0922\u093c\u0940 \u0928\u093f\u0930\u094d\u092e\u093e\u0923 \u0921\u094b\u0928\u0947\u0936\u0928.jpg";
import roofImage from "../images/\u091b\u0924 \u0928\u093f\u0930\u094d\u092e\u093e\u0923 \u0921\u094b\u0928\u0947\u0936\u0928.jpg";

const donations = [
  {
    id: "lift",
    title: "Lift Construction Donation",
    description: "Support the lift construction seva for easier access for elders and devotees.",
    amount: 2100,
    image: liftImage,
  },
  {
    id: "stairs",
    title: "Stair Construction Donation",
    description: "Contribute towards stair construction and strengthen the temple pathway.",
    amount: 1100,
    image: stairsImage,
  },
  {
    id: "roof",
    title: "Roof Construction Donation",
    description: "Offer seva for the roof construction and protection of the sacred space.",
    amount: 5100,
    image: roofImage,
  },
];

export default donations;
