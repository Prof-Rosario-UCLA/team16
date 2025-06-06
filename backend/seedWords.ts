const mongoose = require('mongoose');
import { Word } from "./models/wordModel";
import dotenv from 'dotenv';
dotenv.config();

const words = [
  { text: "apple" }, { text: "balloon" }, { text: "banana" }, { text: "beach" }, { text: "bicycle" },
  { text: "book" }, { text: "bridge" }, { text: "cactus" }, { text: "camera" }, { text: "carrot" },
  { text: "castle" }, { text: "cat" }, { text: "chair" }, { text: "cloud" }, { text: "computer" },
  { text: "cookie" }, { text: "cow" }, { text: "cupcake" }, { text: "dinosaur" }, { text: "dog" },
  { text: "drum" }, { text: "duck" }, { text: "elephant" }, { text: "fire" }, { text: "fish" },
  { text: "flower" }, { text: "frog" }, { text: "giraffe" }, { text: "guitar" }, { text: "hat" },
  { text: "house" }, { text: "ice cream" }, { text: "jellyfish" }, { text: "kangaroo" }, { text: "key" },
  { text: "lamp" }, { text: "leaf" }, { text: "lion" }, { text: "moon" }, { text: "mountain" },
  { text: "mushroom" }, { text: "pencil" }, { text: "pizza" }, { text: "rainbow" }, { text: "rocket" },
  { text: "robot" }, { text: "shark" }, { text: "snowman" }, { text: "sun" }, { text: "tree" },
  { text: "train" }, { text: "airplane" }, { text: "anchor" }, { text: "astronaut" }, { text: "bat" },
  { text: "bed" }, { text: "bottle" }, { text: "broom" }, { text: "bus" }, { text: "butterfly" },
  { text: "candle" }, { text: "clown" }, { text: "crayon" }, { text: "crocodile" }, { text: "diamond" },
  { text: "door" }, { text: "dragon" }, { text: "eagle" }, { text: "ear" }, { text: "eye" },
  { text: "flag" }, { text: "flashlight" }, { text: "fountain" }, { text: "ghost" }, { text: "glasses" },
  { text: "glove" }, { text: "hammer" }, { text: "helicopter" }, { text: "hippo" }, { text: "horse" },
  { text: "hotdog" }, { text: "igloo" }, { text: "island" }, { text: "jungle" }, { text: "kite" },
  { text: "ladder" }, { text: "lizard" }, { text: "motorcycle" }, { text: "octopus" }, { text: "panda" },
  { text: "parrot" }, { text: "penguin" }, { text: "rain" }, { text: "sheep" }, { text: "snail" },
  { text: "spaceship" }, { text: "spoon" }, { text: "strawberry" }, { text: "submarine" }, { text: "suitcase" },
  { text: "telescope" }, { text: "tiger" }, { text: "toothbrush" }, { text: "turtle" }, { text: "umbrella" }
];


const seedWords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Word.deleteMany(); // clears existing words
    await Word.insertMany(words);
    console.log("Words seeded!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedWords();
