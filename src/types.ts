export type Role = 'tourist' | 'farmer' | 'guide' | 'admin';
export type Lang = 'en' | 'ta';

export interface User {
  id: string;
  role: Role;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  village?: string;
  languages?: string[];
  approved?: boolean;
  photo?: string;
  joinedAt?: string;
  idType?: string;
  idNumber?: string;
  idDesc?: string;
  idStatus?: 'none' | 'pending' | 'verified' | 'rejected';
}

export interface Farm {
  id: string;
  name: string;
  region: string;
  crop: string;
  image: string;
  rating: number;
  pricePerDay: number;
  capacity: number;
  activities: string[];
  facilities: string[];
  season: string;
  farmerId: string;
  farmerName: string;
  verified: boolean;
  description: string;
  slots?: string[];
  shop?: { name: string; items: string[]; available: boolean };
}

export interface TourPlan {
  id: string;
  days: 1 | 2 | 3;
  title: string;
  image: string;
  price: number;
  includes: string[];
  itinerary: string[];
}

export interface Booking {
  id: string;
  touristId: string;
  touristName: string;
  farmId: string;
  farmName: string;
  date: string;
  slot?: string;
  visitors: number;
  activities: string[];
  transport: boolean;
  food: boolean;
  stay: boolean;
  total: number;
  payMethod: string;
  txnRef: string;
  payAt: string;
  createdAt: number;
  payStatus: 'Pending Admin Verification' | 'Confirmed' | 'Rejected' | 'Refund Pending' | 'Refunded' | 'No Refund';
  bookStatus: 'Payment Verification Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rejected';
  guideId?: string;
  guideName?: string;
  rejectReason?: string;
  touristPhone?: string;
}

export interface Complaint {
  id: string;
  userId: string;
  role: Role;
  category: string;
  subject: string;
  detail: string;
  bookingId?: string;
  status: 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  replies: { from: string; text: string; at: string }[];
}

export interface Guide {
  id: string;
  userId: string;
  name: string;
  village: string;
  phone: string;
  languages: string[];
  experience: string;
  approved: boolean;
}

export interface Notif {
  id: string;
  userId: string;
  text: string;
  at: string;
  read: boolean;
}
