"use client";
import { useState } from "react";

export default function NewProductPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
  });

  async function handleSubmit() {
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-4xl font-bold">Nuevo producto</h1>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          placeholder={key}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      ))}

      <button className="bg-green-600" onClick={handleSubmit}>
        Publicar
      </button>
    </div>
  );
}