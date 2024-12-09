"use client"; 
import Image from "next/image";
import init from '../common/init';
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import MovieList from '../Components/movieList';
import Header from '../Components/header';

export default function PagePrincipale() {
  const { auth } = init();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
      // Pour Surveiller les changements d'état d'authentification
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
              setUser(currentUser);
          } else {
              // Rediriger si l'utilisateur n'est pas connecté
              router.push('../login');
          }
      });

      return () => unsubscribe(); // Nettoyage lors de la fin de l'utilisation
  }, [auth, router]);
  return (
    <>
      <Header /> 
      <MovieList/>   
    </>
  );
}
