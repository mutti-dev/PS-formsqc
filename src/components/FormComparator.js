import React, { useState } from "react";

export default function FormComparator() {
  const [sandboxJson, setSandboxJson] = useState("");
  const [prodJson, setProdJson] = useState("");
  const [similar, setSimilar] = useState([]);
  const [missing, setMissing] = useState([]);
  const [warnings, setWarnings] = useState([]);

  // recursive function to extract all fields
  const extractFields = (components, fields = {}) => {
    components.forEach((comp) => {
      if (comp.key) {
        fields[comp.key] = comp.label || "";
      }
      if (comp.components) {
        extractFields(comp.components, fields);
      }
      if (comp.columns) {
        comp.columns.forEach((col) => extractFields(col.components, fields));
      }
    });
    return fields;
  };

  const compareForms = () => {
    try {
      const sandboxObj = JSON.parse(sandboxJson);
      const prodObj = JSON.parse(prodJson);

      // dono forms se fields nikaal lo
      const sandboxFields = extractFields(sandboxObj.components || sandboxObj);
      const prodFields = extractFields(prodObj.components || prodObj);

      const sim = [];
      const miss = [];
      const warn = [];

      Object.keys(prodFields).forEach((key) => {
        if (sandboxFields[key]) {
          // key same, ab label check karo
          if (prodFields[key] !== sandboxFields[key]) {
            warn.push(`⚠ Label changed for key "${key}" (Prod: "${prodFields[key]}", Sandbox: "${sandboxFields[key]}")`);
          } else {
            sim.push(`${key} (${prodFields[key]})`);
          }
        } else {
          miss.push(`❌ Missing in Sandbox: ${key} (${prodFields[key]})`);
        }
      });

      Object.keys(sandboxFields).forEach((key) => {
        if (!prodFields[key]) {
          miss.push(`❌ Missing in Prod: ${key} (${sandboxFields[key]})`);
        }
      });

      setSimilar(sim);
      setMissing(miss);
      setWarnings(warn);
    } catch (e) {
      alert("❌ Invalid JSON format, please check your input!");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Form Comparator</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <textarea
          className="w-full h-60 p-2 border rounded"
          placeholder="Paste Sandbox JSON here"
          value={sandboxJson}
          onChange={(e) => setSandboxJson(e.target.value)}
        />
        <textarea
          className="w-full h-60 p-2 border rounded"
          placeholder="Paste Prod JSON here"
          value={prodJson}
          onChange={(e) => setProdJson(e.target.value)}
        />
      </div>

      <button
        onClick={compareForms}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Compare
      </button>

      <div className="mt-4">
        <h2 className="font-semibold">✅ Similar Fields</h2>
        <ul className="list-disc ml-6">
          {similar.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold text-red-600">❌ Missing Fields</h2>
        <ul className="list-disc ml-6">
          {missing.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold text-yellow-600">⚠ Warnings</h2>
        <ul className="list-disc ml-6">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
