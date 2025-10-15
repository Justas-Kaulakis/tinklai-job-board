import React from "react";

const JobTypeTag = ({
    category,
}: {
    category: ("OFFER" | "WANTED") | string;
}) => {
    return (
        <span
            className={`text-xs px-2 py-1 rounded ${
                category === "OFFER"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
            }`}
        >
            {category === "OFFER" ? "Siūlau darbą" : "Ieškau darbo"}
        </span>
    );
};

export default JobTypeTag;
