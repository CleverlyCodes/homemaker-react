import { useState } from 'react';
import firebaseConfig from '../firebaseConfig';
import logo from '../logo.svg';
import { initializeApp } from "firebase/app";
import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signOut,
} from 'firebase/auth';
import ItemCard from "./ItemCard";

import { getFirestore } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore"; 

export default function Login () {

  const app = initializeApp(firebaseConfig);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  const [user, setUser] = useState(null);
  const [list, setList] = useState([]);

  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);

  const logOut = (() => {
    signOut(auth);
    setUser(null);
  });

  const signIn = (() => {
    signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      setUser(result.user);
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
  });

  const getRecipes = (() => {
    const recipes = [];

    getDocs(collection(db, "recipes")).then((results) => {
      results.forEach((result) => {
        console.log(`${result.id} ${result.data().name}`);
        if (result.data().created_by === user.uid) {
          recipes.push({id: result.id, data: result.data()});
        }
      });

      setList(recipes);
    });
  });

  const getIngredients = (() => {
    const ingredients = [];

    getDocs(collection(db, "ingredients")).then((results) => {
      results.forEach((result) => {
        console.log(`${result.id} ${result.data().name}`);
        if (result.data().created_by === user.uid) {
          ingredients.push({id: result.id, data: result.data()});
        }
      });

      setList(ingredients);
    });
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>Home Maker</h1>
      </header>

      <header className="subheader">
        {
          user 
            ? <>
                <p>Hello, {user.displayName}</p>
                <p>User ID: {user.uid}</p>
              </>
            : <p>Please sign in.</p>
        }
        {
          user
            ? <>
                <button onClick={logOut}>Sign out</button>
              </>
            : <button onClick={signIn}>Sign in with Google</button>
        }
      </header>

      {
        user 
          ? <>
              <button onClick={getRecipes}>Get Recipes</button>
              <button onClick={getIngredients}>Get Ingredients</button>
            </>
          : <></>
      }

      <div className="recipe-section">
      {list.map((item) => {
        return (
          <ItemCard key={item.id} recipe={item.data} />
        );
      })}
      </div>
    </div>
  );
}