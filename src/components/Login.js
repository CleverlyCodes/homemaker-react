import { useState } from 'react';
import firebaseConfig from '../firebaseConfig';
import { initializeApp } from "firebase/app";
import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signOut,
} from 'firebase/auth';
import ItemCard from "./ItemCard";

import { getFirestore } from "firebase/firestore";
import { doc, collection, getDocs, getDoc, addDoc, deleteDoc } from "firebase/firestore"; 

export default function Login () {

  const app = initializeApp(firebaseConfig);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  const [user, setUser] = useState(null);
  const [list, setList] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);

  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);

  const logOut = (() => {
    signOut(auth);
    setUser(null);
    setList([]);
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

  const createItem = (async (title, description, type) => {
    // Add a new document with a generated id.
    const docRef = await addDoc(collection(db, type), {
      name: title,
      description: description,
      created_by: user.uid,
    });
    console.log(`${type} written with ID: ${docRef.id}`);

    switch(type) {
      case 'ingredients':
        return getIngredients();
      case 'recipes':
        return getRecipes();
      default:
        return getRecipes();
    }
  });

  const deleteItem = (async (itemId, type) => {
    await deleteDoc(doc(db, type, itemId));

    switch(type) {
      case 'ingredients':
        return getIngredients();
      case 'recipes':
        return getRecipes();
      default:
        return getRecipes();
    }
  });

  const getRecipes = (() => {
    const recipes = [];

    getDocs(collection(db, "recipes")).then((results) => {
      results.forEach((result) => {
        console.log(`${result.id} ${result.data().name}`);
        if (result.data().created_by === user.uid) {
          recipes.push({type: 'recipes', id: result.id, data: result.data()});
        }
      });

      setCurrentItem(null);
      setList(recipes);
    });
  });

  const getIngredients = (() => {
    const ingredients = [];

    getDocs(collection(db, "ingredients")).then((results) => {
      results.forEach((result) => {
        console.log(`${result.id} ${result.data().name}`);
        if (result.data().created_by === user.uid) {
          ingredients.push({type: 'ingredients', id: result.id, data: result.data()});
        }
      });

      setCurrentItem(null);
      setList(ingredients);
    });
  });

  const getSpecificIngredients = ((ingredients) => {
    if (!ingredients) return;
    const ingredientsList = [];

    ingredients.forEach(async (item) => {
      const docRef = doc(db, 'ingredients', item);
      const ingredient = await getDoc(docRef);

      if (ingredient.exists()) {
        console.log("Document data:", ingredient.data());
        ingredientsList.push({type: 'ingredients', id: ingredient.id, data: ingredient.data()});
        setList(ingredientsList);
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
    });
  });

  const selectItem = (async (itemId, type) => {
    const docRef = doc(db, type, itemId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setList([])
      console.log("Document data:", docSnap.data());
      setCurrentItem(docSnap.data());

      getSpecificIngredients(docSnap.data().ingredients);
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
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
              <button onClick={event => createItem('Sundubu Jjigae', 'Korean seafood tofu soup', 'recipes')}>Add Recipe</button>
              <button onClick={event => createItem('Soy Sauce', 'Soy sauce is a liquid condiment of Chinese origin...', 'ingredients')}>Add Ingredient</button>
              <button onClick={getRecipes}>Get Recipes</button>
              <button onClick={getIngredients}>Get Ingredients</button>
            </>
          : <>
              <button onClick={event => createItem('Sundubu Jjigae', 'Korean seafood tofu soup', 'recipes')}>Add Recipe</button>
              <button onClick={event => createItem('Soy Sauce', 'Soy sauce is a liquid condiment of Chinese origin...', 'ingredients')}>Add Ingredient</button>
            </>
      }

      {
        currentItem
          ? <>
              <h1>{currentItem.name}</h1>
              <h2>{currentItem.description}</h2>

              {
                currentItem.ingredients
                  ? <h3>Ingredients:</h3>
                  : <></>
              }
              
            </>
          : <></>
      }

      <div className="recipe-section">
        {list.map((item) => {
          return (
            <ItemCard selectItem={selectItem} deleteItem={deleteItem} key={item.id} item={item} />
          );
        })}
      </div>
    </div>
  );
}
