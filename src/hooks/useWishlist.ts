import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export function useWishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage or Firestore
  useEffect(() => {
    let isMounted = true;

    async function initializeWishlist() {
      if (!user) {
        // Load from local storage for guests
        const local = localStorage.getItem('guest_wishlist');
        if (local && isMounted) {
          setWishlist(JSON.parse(local));
        }
        if (isMounted) setLoading(false);
      } else {
        // Load from Firestore for users, and merge local items if they exist
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let firestoreWishlist: string[] = [];
          if (userDoc.exists() && userDoc.data().wishlist) {
            firestoreWishlist = userDoc.data().wishlist;
          }

          // Merge local storage items up to firestore if any exist
          const local = localStorage.getItem('guest_wishlist');
          if (local) {
            const localItems = JSON.parse(local) as string[];
            const merged = Array.from(new Set([...firestoreWishlist, ...localItems]));
            
            // Only update if there are new items to sync
            if (merged.length > firestoreWishlist.length) {
              await setDoc(userDocRef, { wishlist: merged }, { merge: true });
              firestoreWishlist = merged;
            }
            
            // Clear local storage after successful merge
            localStorage.removeItem('guest_wishlist');
          }

          if (isMounted) {
            setWishlist(firestoreWishlist);
            setLoading(false);
          }
        } catch (error) {
          console.error("Failed to sync wishlist:", error);
          if (isMounted) setLoading(false);
        }
      }
    }

    initializeWishlist();
    return () => { isMounted = false; };
  }, [user]);

  const toggleProduct = async (productId: string) => {
    const isWished = wishlist.includes(productId);
    
    // Optimistic UI update
    const newWishlist = isWished 
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
      
    setWishlist(newWishlist);

    if (!user) {
      // Save to local storage
      localStorage.setItem('guest_wishlist', JSON.stringify(newWishlist));
    } else {
      // Save to Firestore
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          wishlist: isWished ? arrayRemove(productId) : arrayUnion(productId)
        }, { merge: true });
      } catch (error) {
        console.error("Failed to update remote wishlist:", error);
        // Revert optimistic update gracefully if desired
        setWishlist(wishlist);
      }
    }
  };

  const isFavorite = (productId: string) => wishlist.includes(productId);

  return { wishlist, toggleProduct, isFavorite, loading };
}
