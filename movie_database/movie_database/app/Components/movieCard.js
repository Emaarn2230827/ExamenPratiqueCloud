"use client";
import React from 'react';
import init from '../common/init';
import {  deleteDoc, doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation";
import { getStorage, ref, deleteObject } from "firebase/storage";

function MovieCard({ id, titre, description, image }) {
    const {db, auth} = init()
    const router = useRouter();
    const storage = getStorage();
    const handleDeleteTask = async () => {
        try {
        const user = auth.currentUser;
        if (!user) {
            console.log('User not authenticated');
            router.push('../login');
            return;
        }

        const documentRef = doc(db, "Films", id);
        const documentSnapshot = await getDoc(documentRef);

        if (documentSnapshot.exists()) {
            const documentData = documentSnapshot.data();
        
            if (documentData.image) {
                console.log("documentData.image: " + documentData.image);
                const imageRef = ref(storage, documentData.image);
                await deleteObject(imageRef);
            }
        
            await deleteDoc(documentRef);
            console.log("Document supprimé");
        } else {
            console.log("Le document n'existe pas");
        }
        } catch (err) {
            console.error("Error deleting document: ", err);
            console.log("id: "+id);
        }
    };
    
    return (
        <div className="card col-lg-4 col-12" key={id}>
          <img src={image} className="card-img-top" alt={titre} />
          <div className="card-body">
            <h5 className="card-title">{titre}</h5>
            <p className="card-text">{description}</p>
            <a href="/accueil" className="btn btn-primary">📖</a> <a href="/accueil" className="btn btn-dark" onClick={handleDeleteTask}>🗑️</a>
          </div>
      </div>     
    );
}

export default MovieCard;
