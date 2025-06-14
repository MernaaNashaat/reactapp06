import React, { useState } from "react";
import "./ConcreteMixForm.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { IoTDataPlaneClient, PublishCommand } from "@aws-sdk/client-iot-data-plane";
import { CognitoIdentityClient, GetCredentialsForIdentityCommand } from "@aws-sdk/client-cognito-identity";
import { fetchAuthSession } from "aws-amplify/auth";

const ConcreteMixForm = () => {
    const [materialList, setMaterialList] = useState([]);
    const [material, setMaterial] = useState("");
    const [quantity, setQuantity] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleUpdateMaterial = () => {
        let newErrors = {};
        if (!material) {
            newErrors.material = "Please select a material.";
        }
        if (!quantity || parseFloat(quantity) <= 0) {
            newErrors.quantity = "Quantity must be greater than 0.";
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const existingIndex = materialList.findIndex((item) => item.material === material);
        const newEntry = { material, quantity: parseFloat(quantity).toFixed(2) };

        if (existingIndex !== -1) {
            const updatedList = [...materialList];
            updatedList[existingIndex] = newEntry;
            setMaterialList(updatedList);
        } else {
            setMaterialList([...materialList, newEntry]);
        }
        setQuantity("");
        setMaterial("");
    };

    const handleDeleteMaterial = (materialToDelete) => {
        setMaterialList(materialList.filter((item) => item.material !== materialToDelete));
    };

    const validateMainFields = () => {
        const newErrors = {};
        if (!document.getElementById("idName").value.trim()) {
            newErrors.idName = "Identification Name is required.";
        }
        if (!document.getElementById("code").value.trim()) {
            newErrors.code = "Code is required.";
        }
        if (materialList.length === 0) {
            newErrors.materialList = "Add at least one material.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const ORDER = async () => {
        if (!validateMainFields()) {
            return;
        }

        const data = {
            idName: document.getElementById("idName").value.trim() || null,
            code: document.getElementById("code").value.trim() || null,
            description: document.getElementById("description").value.trim() || null,
            wcRatio: document.getElementById("wcr").value ? parseFloat(document.getElementById("wcr").value) : 0,
            timeLimit: document.getElementById("timeLimit").value ? parseFloat(document.getElementById("timeLimit").value) : 0,
            strengthClass: document.getElementById("strength").value || null,
            slumpClass: document.getElementById("slump").value || null,
            exposureClass: document.getElementById("exposure").value || null,
            aggDiameter: document.getElementById("aggDiameter").value ? parseFloat(document.getElementById("aggDiameter").value) : 0,
            wcTolerance: document.getElementById("wcrTolerance").value ? parseFloat(document.getElementById("wcrTolerance").value) : 0,
            materialList: materialList // Only send material list, no separate material or quantity
        };

        try {
            const session = await fetchAuthSession({ forceRefresh: false });
            const id = session.identityId;
            const idToken = session.tokens.idToken.toString();

            const cognitoClient = new CognitoIdentityClient({
                region: "eu-north-1"
            });

            const cognitoCommand = new GetCredentialsForIdentityCommand({
                IdentityId: id,
                Logins: {
                    "cognito-idp.eu-north-1.amazonaws.com/eu-north-1_fbBYQUTeP": idToken
                }
            });

            const cognitoCreds = await cognitoClient.send(cognitoCommand);

            const iotClient = new IoTDataPlaneClient({
                region: "eu-north-1",
                credentials: {
                    accessKeyId: cognitoCreds.Credentials.AccessKeyId,
                    secretAccessKey: cognitoCreds.Credentials.SecretKey,
                    sessionToken: cognitoCreds.Credentials.SessionToken,
                    expiration: cognitoCreds.Credentials.Expiration
                }
            });

            const encodedPayload = new TextEncoder().encode(JSON.stringify(data));

            const publishParams = {
                topic: "new_batch_plant/orders",
                qos: 0,
                payload: encodedPayload,
                retain: false
            };

            const publishCommand = new PublishCommand(publishParams);
            const result = await iotClient.send(publishCommand);
            console.log("Publish success:", result);

            await Swal.fire({
                title: "✅ Order Sent!",
                text: "Your concrete mix order has been successfully sent.",
                icon: "success",
                confirmButtonText: "OK"
            });

            navigate("/new");
        } catch (error) {
            console.error("MQTT Publish Error:", error);
            Swal.fire({
                title: "❌ Failed to Send",
                text: "An error occurred while sending your order.",
                icon: "error"
            });
        }
    };

    return (
        <div className="container">
            <h2>Concrete Mix Recipe</h2>

            <label htmlFor="idName">Identification Name</label>
            <input type="text" id="idName" placeholder="e.g., Mix1 (min 1 char)" />
            {errors.idName && <small className="error">{errors.idName}</small>}

            <label htmlFor="code">Code</label>
            <input type="text" id="code" placeholder="e.g., M1 (min 1 char)" />
            {errors.code && <small className="error">{errors.code}</small>}

            <label htmlFor="material">Select Material</label>
            <select id="material" value={material} onChange={(e) => setMaterial(e.target.value)}>
                <option value="">-- Select --</option>
                {[
                    "Admix 101",
                    "Admix 102",
                    "Admix 103",
                    "Aggregate 101",
                    "Aggregate 102",
                    "Aggregate 103",
                    "Aggregate 104",
                    "Aggregate 105",
                    "Aggregate 106",
                    "Cement 101",
                    "Cement 102",
                    "Cement 103",
                    "Cement 104",
                    "colors 101",
                    "Ice 101",
                    "Water 101"
                ].map((item) => (
                    <option key={item} value={item}>
                        {item}
                    </option>
                ))}
            </select>
            {errors.material && <small className="error">{errors.material}</small>}

            <label htmlFor="quantity">Quantity (kg)</label>
            <input
                type="number"
                id="quantity"
                placeholder="Min 0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
            />
            {errors.quantity && <small className="error">{errors.quantity}</small>}

            <div className="button-group">
                <button className="update-btn" onClick={handleUpdateMaterial}>
                    Update Material
                </button>
            </div>

            <div className="material-list">
                {materialList.map((item) => (
                    <p
                        key={item.material}
                        className="material-item"
                        onClick={() => handleDeleteMaterial(item.material)}
                        title="Click to delete"
                    >
                        {item.material}: {item.quantity} kg
                    </p>
                ))}
            </div>
            {errors.materialList && <small className="error">{errors.materialList}</small>}

            <label htmlFor="description">Description</label>
            <textarea id="description" rows="2" placeholder="Optional description..."></textarea>

            <label htmlFor="wcr">W/C Ratio</label>
            <input type="number" step="0.01" id="wcr" placeholder="Min 0.10" />

            <label htmlFor="timeLimit">Time Limit For Concrete Use (hrs)</label>
            <input type="number" step="0.01" id="timeLimit" placeholder="Min 0.1 hrs" />

            <label htmlFor="strength">Strength Class</label>
            <select id="strength" defaultValue="">
                <option value="">-- Select --</option>
                {["C15", "C20", "C25", "C30", "C35", "C40"].map((cls) => (
                    <option key={cls} value={cls}>
                        {cls}
                    </option>
                ))}
            </select>

            <label htmlFor="slump">Slump Class</label>
            <select id="slump" defaultValue="">
                <option value="">-- Select --</option>
                {["S1", "S2", "S3", "S4", "S5"].map((cls) => (
                    <option key={cls} value={cls}>
                        {cls}
                    </option>
                ))}
            </select>

            <label htmlFor="exposure">Exposure Class</label>
            <select id="exposure" defaultValue="">
                <option value="">-- Select --</option>
                {["Category F", "Category S", "Category W", "Category C"].map((cls) => (
                    <option key={cls} value={cls}>
                        {cls}
                    </option>
                ))}
            </select>

            <label htmlFor="aggDiameter">Aggregate Max Diameter (mm)</label>
            <input type="number" id="aggDiameter" placeholder="Min 1 mm" />

            <label htmlFor="wcrTolerance">Max Tolerance % for W/C Ratio</label>
            <input type="number" step="0.01" id="wcrTolerance" placeholder="Min 0.01" />

            <div className="button-group1">
                <button className="update1-btn" onClick={ORDER}>
                    Order
                </button>
            </div>
        </div>
    );
};

export default ConcreteMixForm;