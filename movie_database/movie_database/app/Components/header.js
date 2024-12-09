"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import init from '../common/init';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null); // Stocker l'utilisateur
    const router = useRouter();
    const [imageFiles, setImageFiles] = useState([]);
    const { auth } = init();
    const storage = getStorage();

    useEffect(() => {
        // Surveiller les changements d'état d'authentification
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchProfilePictures(currentUser);
            } else {
                // Rediriger si l'utilisateur n'est pas connecté
                router.push('../login');
            }
        });

        return () => unsubscribe(); // Nettoyage lors de la fin de l'utilisation
    }, [auth, router]);
    const fetchProfilePictures = async (currentUser) => {
        const listRef = ref(storage, `${currentUser.uid}/ProfilePicture`);

        try {
            const res = await listAll(listRef);
            if (res.items.length > 0) {
                // Récupère les métadonnées pour trier les fichiers par date de création
                const itemsWithMetadata = await Promise.all(
                    res.items.map(async (itemRef) => {
                        const metadata = await getMetadata(itemRef); // Utilisation correcte de getMetadata
                        return { itemRef, timeCreated: metadata.timeCreated };
                    })
                );

                // Trie les fichiers par date de création (le plus récent en premier)
                itemsWithMetadata.sort((a, b) => new Date(b.timeCreated) - new Date(a.timeCreated));

                // Récupère l'URL de la dernière image ajoutée
                const lastImageUrl = await getDownloadURL(itemsWithMetadata[0].itemRef);

                // Met à jour l'état avec l'URL de la dernière image seulement
                setImageFiles([lastImageUrl]);
            } else {
                console.log("No profile pictures found.");
            }
        } catch (error) {
            console.error("Error fetching profile pictures:", error);
        }
    };

    useEffect(() => {
        // Déclencher un rafraîchissement de l'image toutes les 1 seconde
        if (user) {
            const interval = setInterval(() => {
                fetchProfilePictures(user);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary bg-dark" data-bs-theme="dark">
            <div className="container-fluid">
            <a className="navbar-brand" href="../accueil">The Movie Database</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                    <a className="nav-link" href="../addMovie">➕Add Movie</a>        
                </li>
                </ul>
                <form className="d-flex" role="search">
                <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                <button className="btn btn-outline-success" type="submit">Search</button>
                </form>
                <li className="d-flex">
                    {user && imageFiles.length > 0 && (
                        <Link href={`../Profil/${user.uid}`} className="nav-link mx-5">
                            <img src={imageFiles[0]} alt="logoConnexion" id="logoConnexion" className="rounded-circle" width={70} height={70} />
                        </Link>
                    )}
                </li>
            </div>
            </div>
        </nav>
    );
}

export default Header;
