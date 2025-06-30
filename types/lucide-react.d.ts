"use client";
declare module "lucide-react" {
  import * as React from "react";

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
  }

  export const Clock: React.FC<LucideProps>;
  export const CheckCircle: React.FC<LucideProps>;
  export const XCircle: React.FC<LucideProps>;
  export const AlertCircle: React.FC<LucideProps>;

  export const Users: React.FC<LucideProps>;
  export const Image: React.FC<LucideProps>;
  export const Package: React.FC<LucideProps>;
  export const ShoppingCart: React.FC<LucideProps>;
  export const TrendingUp: React.FC<LucideProps>;
  export const Activity: React.FC<LucideProps>;

  export const Plus: React.FC<LucideProps>;
  export const Mail: React.FC<LucideProps>;
  export const Trash2: React.FC<LucideProps>;
  export const Download: React.FC<LucideProps>;
  export const Search: React.FC<LucideProps>;
  export const Edit: React.FC<LucideProps>;
  export const Filter: React.FC<LucideProps>;
  export const Database: React.FC<LucideProps>;

  export const Palette: React.FC<LucideProps>;
  export const BookOpen: React.FC<LucideProps>;
  export const Home: React.FC<LucideProps>;
  export const Settings: React.FC<LucideProps>;
  export const UserPlus: React.FC<LucideProps>;
  export const Edit: React.FC<LucideProps>;
  export const ChevronRight: React.FC<LucideProps>;
  export const ChevronLeft: React.FC<LucideProps>;
  export const Crown: React.FC<LucideProps>;

  export const X: React.FC<LucideProps>;
  export const Package: React.FC<LucideProps>;
  export const User: React.FC<LucideProps>;
  export const MapPin: React.FC<LucideProps>;
  export const Calendar: React.FC<LucideProps>;
  export const DollarSign: React.FC<LucideProps>;

  export const ArrowUpRight: React.FC<LucideProps>;
  export const ArrowDownRight: React.FC<LucideProps>;

  export type LucideIcon = React.FC<LucideProps>;

  // Add any other icons you need here
}
