import React, { useState } from "react";
import { Redirect } from "wouter";
import { getSessionUser } from "@/lib/auth-session";

export default function AdminPage() {
  const user = getSessionUser();
  if (!user || user.role !== "admin") {
    return <Redirect to="/admin-login" />;
  }

  const [fields, setFields] = useState({
    admin1: "",
    admin2: "",
    admin3: "",
    admin4: "",
    admin5: "",
    admin6: "",
    admin7: "",
    admin8: "",
  });

  const keys = Object.keys(fields) as Array<keyof typeof fields>;

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto border border-[#1A202C] bg-[#0D111A] p-6">
        <h1 className="text-2xl font-bold">Admin Page</h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          Hidden internal settings placeholder (8 admin fields).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keys.map((key, idx) => (
            <label key={key} className="text-sm">
              <span className="block mb-1 text-gray-300">Admin Slot {idx + 1}</span>
              <input
                className="w-full h-10 bg-[#0A0D14] border border-[#1A202C] px-3"
                value={fields[key]}
                onChange={(e) => {
                  const value = e.target.value;
                  setFields((prev) => ({ ...prev, [key]: value }));
                }}
                placeholder="Name / Email / Role"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

