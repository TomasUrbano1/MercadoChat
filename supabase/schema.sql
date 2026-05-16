create table profiles (
  id uuid primary key references auth.users(id),
  username text,
  created_at timestamp default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric,
  category text,
  image_url text,
  owner_id uuid references profiles(id),
  created_at timestamp default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  buyer_id uuid references profiles(id),
  seller_id uuid references profiles(id),
  created_at timestamp default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id),
  sender_id uuid references profiles(id),
  content text,
  created_at timestamp default now()
);