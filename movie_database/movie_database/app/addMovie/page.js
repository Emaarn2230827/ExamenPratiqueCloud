"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../Components/header';
import init from '../common/init'; 
import {onAuthStateChanged} from "firebase/auth"
import { collection, addDoc} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


export default function AddTask() {
    const { db } = init();
    const { auth } = init();
    const [error, setError] = useState('');
    const router = useRouter();
    const storage = getStorage();
    const [user, setUser] = useState(null);
   
    useEffect(() => {
        // Surveiller les changements d'état d'authentification
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!auth.currentUser) {
            setError('User not authenticated');
            return;
        }
    
        const { currentUser } = auth;
        const image = e.target.image.files[0]; 
    
        try {
            // Télécharger l'image dans Firebase Storage
            const refFile = ref(storage, `${currentUser.uid}/FilmPicture/${image.name}`);
            await uploadBytes(refFile, image);
            console.log('Uploaded task image');
    
            // Récupérer l'URL de téléchargement
            const imageUrl = await getDownloadURL(refFile);
    
            // Ajouter le document à Firestore
            const TaskDocRef = collection(db, "Films");
            await addDoc(TaskDocRef, {
                titre: e.target.name.value,
                description: e.target.description.value,
                image: imageUrl, 
                userId: currentUser.uid
            });
    
            console.log("Document written with ID: ", TaskDocRef.id);
    
            // Redirection
            router.push('../accueil'); // Redirect to accueil
    
        } catch (error) {
            console.error(error);
            setError('An error occurred');
        }
    };
    

    return (
        <>
            <Header />
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card border-0 bg-light shadow">
                            <div className="card-body p-5 contenuLambda">
                                <h2 className="card-title text-center mb-4">Add a Movie</h2>
                                {error && <p className="text-danger">{error}</p>}
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="name">Title of the Movie</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            name="name"                         
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="description">Description</label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            name="description"
                                            required
                                        />
                                    </div>
                                   
                                    <div className="form-group">
                                    <label htmlFor='image'>Image *</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="image"
                                        required
                                    />
                                    </div>
                                    <br />
                                    <button type="submit" className="btn btn-primary btn-block">Save</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
