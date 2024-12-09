"use client";

import React, { useState, useEffect } from 'react';
import MovieCard from './movieCard';  
import init from '../common/init';
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

function MovieList() {
    const { db, auth } = init();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const storage = getStorage();
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

    // Fonction pour récupérer les films
    const fetchMovie = async () => {
        if (!user) return; // Si l'utilisateur n'est pas encore défini, ne rien faire

        try {
            // Requête pour ne récupérer que les films de l'utilisateur connecté
            const q = query(collection(db, "Films"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);

            // Récupération des films avec images
            const moviesWithImages = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const movieData = doc.data();
                    if (movieData.image) {
                        const imageRef = ref(storage, movieData.image);
                        const imageUrl = await getDownloadURL(imageRef);
                        return { id: doc.id, ...movieData, image: imageUrl }; 
                    }
                    return { id: doc.id, ...movieData };
                })
            );

            setMovies(moviesWithImages);
        } catch (error) {
            console.error("Error fetching movies: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovie(); // Appeler la fonction de récupération des films

        const interval = setInterval(fetchMovie, 1000); // Rafraîchir les tâches toutes les 1000ms
        return () => clearInterval(interval);
    }, [db, user]);

    return (
        <div className="container-fluid">
            <div className="row"> 
                {loading ? (
                    <p>Loading...</p>
                ) : movies.length > 0 ? (
                    movies.map((movie) => (
                        <MovieCard       
                            key={movie.id} 
                            id={movie.id}
                            titre={movie.titre}
                            description={movie.description}
                            image={movie.image || ""} 
                        />
                    ))
                ) : (
                    <h1 className="scrolling-text">No movies found</h1>
                )}
            </div>
        </div>
    );
}

export default MovieList;
