'use client'
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  Timestamp,
  DocumentData,
  WithFieldValue
} from 'firebase/firestore';

// Pagination interface
export interface PaginationParams {
  pageSize: number;
  lastDoc?: QueryDocumentSnapshot;
}

export interface PaginatedResult<T> {
  data: T[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

export class CrudService<T extends WithFieldValue<DocumentData>> {
  constructor(private collectionName: string) {}

  async getAll() {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (T & { id: string })[];
  }

  async getPaginated(params: PaginationParams): Promise<PaginatedResult<T & { id: string }>> {
    const { pageSize, lastDoc } = params;
    
    let q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (T & { id: string })[];

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      data,
      lastDoc: lastVisible || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  }

  async getOne(id: string) {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
    }
    return null;
  }

  async create(data: T) {
    const docRef = await addDoc(collection(db, this.collectionName), data);
    return { id: docRef.id, ...data };
  }

  async update(id: string, data: Partial<T>) {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, data as any);
    return { id, ...data };
  }

  async delete(id: string) {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
    return id;
  }
}

// Generic CRUD operations
export const getCollection = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
};

export const getCollectionPaginated = async (collectionName: string, params: PaginationParams): Promise<PaginatedResult<any>> => {
  try {
    const { pageSize, lastDoc } = params;
    
    let q = query(
      collection(db, collectionName),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      data,
      lastDoc: lastVisible || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return { data: [], lastDoc: null, hasMore: false };
  }
};

export const addDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding to ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error(`Error updating ${collectionName}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting from ${collectionName}:`, error);
    throw error;
  }
};


export const getSingleUser = async (id: string) => {
  const userRef = doc(db, 'users', id);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    return null;
  }
  return userSnap.data();
};

// Users specific operations
export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || '',
        displayName: data.displayName || '',
        createdAt: data.createdAt,
        photoURL: data.photoURL || '',
        isAdmin: data.isAdmin || false
      };
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUsersPaginated = async (params: PaginationParams): Promise<PaginatedResult<any>> => {
  try {
    const { pageSize, lastDoc } = params;
    
    let q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || '',
        displayName: data.displayName || '',
        createdAt: data.createdAt,
        photoURL: data.photoURL || '',
        isAdmin: data.isAdmin || false
      };
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      data,
      lastDoc: lastVisible || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: [], lastDoc: null, hasMore: false };
  }
};

// Images specific operations
export const getImages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'images'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};

export const getImagesByUserId = async (userId: string) => {
  const imagesRef = collection(db, 'images');
  const q = query(imagesRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.docs.length === 0) {
    return [];
  }
  console.log(querySnapshot.docs.map(doc => doc.data()), "images");
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];
};

export const getImagesPaginated = async (params: PaginationParams): Promise<PaginatedResult<any>> => {
  try {
    const { pageSize, lastDoc } = params;
    
    let q = query(
      collection(db, 'images'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      data,
      lastDoc: lastVisible || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    return { data: [], lastDoc: null, hasMore: false };
  }
};

// Products specific operations
export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductsPaginated = async (params: PaginationParams): Promise<PaginatedResult<any>> => {
  try {
    const { pageSize, lastDoc } = params;
    
    let q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      data,
      lastDoc: lastVisible || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: [], lastDoc: null, hasMore: false };
  }
};


export const getOrdersByUserId = async (userId: string) => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.docs.length === 0) {
    return [];
  }
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];
};

// Orders specific operations
export const getOrders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: doc.id, // Use document ID as orderId
        userId: data.userId || '',
        totalAmount: data.totalAmount || 0,
        paymentStatus: data.paymentStatus || 'pending',
        status: data.status || 'pending',
        createdAt: data.createdAt,
        shippingAddress: data.shippingAddress || { name: '', city: '', country: '' }
      };
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const getOrdersPaginated = async (params: PaginationParams): Promise<PaginatedResult<any>> => {
  try {
    const { pageSize, lastDoc } = params;
    
    let q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: doc.id, // Use document ID as orderId
        userId: data.userId || '',
        totalAmount: data.totalAmount || 0,
        paymentStatus: data.paymentStatus || 'pending',
        status: data.status || 'pending',
        createdAt: data.createdAt,
        shippingAddress: data.shippingAddress || { name: '', city: '', country: '' }
      };
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      data,
      lastDoc: lastVisible || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { data: [], lastDoc: null, hasMore: false };
  }
};

// Home Images specific operations
export const getHomeImages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'home-images'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        file_link: data.file_link || '',
        aspect_ratio: data.aspect_ratio || '16:9',
        dimensions: data.dimensions || '',
        tags: data.tags || [],
        suggested_locations: data.suggested_locations || []
      };
    });
  } catch (error) {
    console.error('Error fetching home images:', error);
    return [];
  }
};

export const getHomeImagesPaginated = async (params: PaginationParams): Promise<PaginatedResult<any>> => {
  try {
    const { pageSize, lastDoc } = params;
    
    let q = query(
      collection(db, 'home-images'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        file_link: data.file_link || '',
        aspect_ratio: data.aspect_ratio || '16:9',
        dimensions: data.dimensions || '',
        tags: data.tags || [],
        suggested_locations: data.suggested_locations || []
      };
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      data,
      lastDoc: lastVisible || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching home images:', error);
    return { data: [], lastDoc: null, hasMore: false };
  }
};

// Artists specific operations
export const getArtists = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'artists'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        artist_name: data.artist_name || '',
        name: data.name || '',
        tags: data.tags || []
      };
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    return [];
  }
};

export const getArtistsPaginated = async (params: PaginationParams): Promise<PaginatedResult<any>> => {
  try {
    const { pageSize, lastDoc } = params;
    
    let q = query(
      collection(db, 'artists'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        artist_name: data.artist_name || '',
        name: data.name || '',
        tags: data.tags || []
      };
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      data,
      lastDoc: lastVisible || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching artists:', error);
    return { data: [], lastDoc: null, hasMore: false };
  }
};

// Subjects specific operations
export const getSubjects = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'subjects'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        category: data.category || '',
        subjects: data.subjects || []
      };
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

export const getSubjectsPaginated = async (params: PaginationParams): Promise<PaginatedResult<any>> => {
  try {
    const { pageSize, lastDoc } = params;
    
    let q = query(
      collection(db, 'subjects'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        category: data.category || '',
        subjects: data.subjects || []
      };
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      data,
      lastDoc: lastVisible || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return { data: [], lastDoc: null, hasMore: false };
  }
};

// Queue specific operations - Fetch from both collections
export const getQueueItems = async () => {
  try {
    // Fetch from orders-req collection
    const ordersReqSnapshot = await getDocs(collection(db, 'orders-req'));
    const ordersReq = ordersReqSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: data.orderId || '',
        processed: data.processed || false,
        createdAt: data.createdAt,
        processedAt: data.processedAt
      };
    });

    // Fetch from order-processing-queue collection
    const processingQueueSnapshot = await getDocs(collection(db, 'order-processing-queue'));
    const processingQueue = processingQueueSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: data.orderId || '',
        status: data.status || 'unknown',
        steps: data.steps || {},
        completedAt: data.completedAt,
        queuedAt: data.queuedAt
      };
    });

    // Combine and process the data
    const queueItems = ordersReq.map(orderReq => {
      const processingData = processingQueue.find(pq => pq.orderId === orderReq.orderId);
      
      if (!orderReq.processed) {
        // Not processed yet
        return {
          id: orderReq.id,
          orderId: orderReq.orderId,
          status: 'queued' as const,
          priority: 'medium' as const,
          createdAt: orderReq.createdAt,
          processed: false,
          processingData: null
        };
      } else {
        // Processed - check processing queue for details
        if (processingData) {
          const lumaprintStatus = processingData.steps?.lumaprint?.status || 'unknown';
          const topazStatus = processingData.steps?.topaz?.status || 'unknown';
          const overallStatus = processingData.status || 'unknown';
          
          let status: 'queued' | 'processing' | 'completed' | 'failed' | 'unknown' = 'completed';
          let priority: 'low' | 'medium' | 'high' = 'low';
          
          if (overallStatus === 'failed') {
            status = 'failed';
            priority = 'high';
          } else if (lumaprintStatus === 'failed' || topazStatus === 'failed') {
            status = 'failed';
            priority = 'high';
          } else if (lumaprintStatus === 'processing' || topazStatus === 'processing') {
            status = 'processing';
            priority = 'medium';
          }

          return {
            id: orderReq.id,
            orderId: orderReq.orderId,
            status,
            priority,
            createdAt: orderReq.createdAt,
            processedAt: orderReq.processedAt,
            processed: true,
            processingData: {
              status: overallStatus,
              lumaprintStatus,
              topazStatus,
              lumaprintError: processingData.steps?.lumaprint?.result?.message || null,
              topazError: processingData.steps?.topaz?.result?.message || null,
              completedAt: processingData.completedAt,
              queuedAt: processingData.queuedAt
            }
          };
        } else {
          // Processed but no processing data found
          return {
            id: orderReq.id,
            orderId: orderReq.orderId,
            status: 'unknown' as const,
            priority: 'medium' as const,
            createdAt: orderReq.createdAt,
            processedAt: orderReq.processedAt,
            processed: true,
            processingData: null
          };
        }
      }
    });

    return queueItems;
  } catch (error) {
    console.error('Error fetching queue items:', error);
    return [];
  }
};

export const getQueueItemsPaginated = async (params: PaginationParams): Promise<PaginatedResult<any>> => {
  try {
    const { pageSize, lastDoc } = params;
    
    let q = query(
      collection(db, 'orders-req'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: data.orderId || '',
        processed: data.processed || false,
        createdAt: data.createdAt,
        processedAt: data.processedAt,
        status: data.processed ? 'completed' : 'queued',
        priority: 'medium'
      };
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      data,
      lastDoc: lastVisible || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching queue items:', error);
    return { data: [], lastDoc: null, hasMore: false };
  }
};

// Admin Users specific operations
export const getAdminUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'admin_users'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
};

// Dashboard statistics
export const getDashboardStats = async () => {
  try {
    const [users, images, products, orders] = await Promise.all([
      getUsers(),
      getImages(),
      getProducts(),
      getOrders()
    ]);

    return {
      totalUsers: users.length,
      totalImages: images.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      recentActivity: await getRecentActivity()
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      totalImages: 0,
      totalProducts: 0,
      totalOrders: 0,
      recentActivity: []
    };
  }
};

// Recent activity
export const getRecentActivity = async () => {
  try {
    const activities: Array<{
      type: string;
      action: string;
      data: any;
      timestamp: any;
    }> = [];
    
    // Get recent orders
    const recentOrders = await getDocs(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5))
    );
    
    recentOrders.docs.forEach(doc => {
      activities.push({
        type: 'order',
        action: 'Order completed',
        data: doc.data(),
        timestamp: doc.data().createdAt
      });
    });

    // Get recent images
    const recentImages = await getDocs(
      query(collection(db, 'images'), orderBy('createdAt', 'desc'), limit(5))
    );
    
    recentImages.docs.forEach(doc => {
      activities.push({
        type: 'image',
        action: 'Image generated',
        data: doc.data(),
        timestamp: doc.data().createdAt
      });
    });

    // Sort by timestamp and return top 10
    return activities
      .sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate())
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

// Set or unset admin status for a user
export const setAdminStatus = async (userId: string, isAdmin: boolean) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isAdmin });
    return true;
  } catch (error) {
    console.error('Error updating admin status:', error);
    throw error;
  }
};
