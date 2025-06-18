import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Authenticator, Image } from "@aws-amplify/ui-react";
import { Flex } from "@aws-amplify/ui-react";
import { IPhone13141 } from "./ui-components";
import "@aws-amplify/ui-react/styles.css";
import { IoTDataPlaneClient, PublishCommand } from "@aws-sdk/client-iot-data-plane";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "@aws-amplify/auth";
import { CognitoIdentityClient, GetCredentialsForIdentityCommand } from "@aws-sdk/client-cognito-identity";
import awsconfig from "./aws-exports";
import { Buffer } from "buffer";
import { IoTClient, AttachPolicyCommand } from "@aws-sdk/client-iot";
import { PubSub, CONNECTION_STATE_CHANGE } from "@aws-amplify/pubsub";
import { Hub } from "aws-amplify/utils";
import { Icon } from "@aws-amplify/ui-react"; // Import if using Amplify UI

import ConcreteMixForm from './components/ConcreteMixForm';
import ReportsPage from './components/Reports/ReportsPage';
import { Link } from 'react-router-dom';



import { withAuthenticator } from '@aws-amplify/ui-react';
//import SecuredButtons from './components/SecuredButtons';

// Configure AWS Amplify
Amplify.configure(awsconfig);

// Initialize PubSub object
const pubsub = new PubSub({
  region: "eu-north-1",
  endpoint: "wss://d08005442xhnb92dfq7y0-ats.iot.eu-north-1.amazonaws.com/mqtt",
});




function App() {

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isActive, setIsActive] = useState(false); //Mixer
  const [isActive1, setIsActive1] = useState(false); //indicator of silo hopper
  const [mixerGate, setMixerGate] = useState(false);  //Mixergate
  const [isActive2, setIsActive2] = useState(false); //indicator of cement hopper
  const [Weighing_conveyor, setWeighing_conveyor] = useState(false);
  const [Inclined_conveyor, setInclined_conveyor] = useState(false);
  const [Water_valve, setWater_valve] = useState(false);


  const [imageUrl, setImageUrl] = useState(
    "https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-22_at_9.11.51_AM-removebg-preview.png"
  );
  const [imageUrl1, setImageUrl1] = useState(
    "https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-22_at_9.11.51_AM-removebg-preview.png"
  );

  const mixerGateColor = mixerGate ? "#E3E4E4" : "rgba(0,221,32,1)";
  const Weighing_conveyorColor = Weighing_conveyor ? "#E3E4E4" : "rgba(0,221,32,1)";
  //Inclined_conveyor 
  const Inclined_conveyorColor = Inclined_conveyor ? "#E3E4E4" : "rgba(0,221,32,1)";
  const Water_valveColor = Water_valve ? "#E3E4E4" : "rgba(0,221,32,1)";

  const [showSecondaryImage, setShowSecondaryImage] = useState(false);
  const [showSecondaryImage1, setShowSecondaryImage1] = useState(false);

  const [weight, setWeight] = useState(null); // State to hold the weight value
  const [Weight_cement, setWeight2] = useState(null); // State to hold the weight cement value
  const [Weight_water, setWeight3] = useState(null); // State to hold the weight water value
  const [State, setState] = useState(null); // State to hold the weight water value





  useEffect(() => {
    // Subscribe to IoT topic
    /*pubsub.subscribe({ topics: "esp32/pub" }).subscribe({
      next: (data) => {
        console.log("Message received", data.message);
        if (data.message === "1") {
          setImageUrl(
            "https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-22_at_9.11.51_AM__1_-removebg-preview.png"
          ); } else if (data.message === "0") {
            setImageUrl(
              "https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-22_at_9.11.51_AM-removebg-preview.png"
            );
        }
      },
      error: (error) => console.error(error),
      complete: () => console.log("Done"),
    });*/

    // Create Subscriber
    pubsub.subscribe({ topics: "esp32/pub" }).subscribe({
      next: (data) => {
        console.log("Full data received:", data);
        console.log("Message details:", data.Aggregate_1_bin_gate);
        // Add additional logging if needed
        if (data.Aggregate_1_bin_gate === true) {
          setImageUrl(
            "https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-22_at_9.11.51_AM__1_-removebg-preview.png"
          );
          // Show the secondary image with animation
          setShowSecondaryImage1(true);

          // Hide the image after the animation
          setTimeout(() => setShowSecondaryImage1(false), 13000);
        }
        else {

          setImageUrl(
            "https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-22_at_9.11.51_AM-removebg-preview.png"
          );
        }
        console.log("Full data received:", data);
        console.log("Message details:", data.Aggregate_2_bin_gate);
        if (data.Aggregate_2_bin_gate === true) {
          setImageUrl1(
            "https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-22_at_9.11.51_AM__1_-removebg-preview.png"
          );
          // Show the secondary image with animation
          setShowSecondaryImage(true);

          // Hide the image after the animation
          setTimeout(() => setShowSecondaryImage(false), 13000);

        } else {
          setImageUrl1(
            "https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-22_at_9.11.51_AM-removebg-preview.png"
          );
        }
        // Update the weight state if it exists in the received data
        if (data.weight !== undefined) {
          setWeight(data.weight);
        }


        if (data.Weight_cement !== undefined) {
          setWeight2(data.Weight_cement);
        }

        if (data.Weight_water !== undefined) {
          setWeight3(data.Weight_water);
        }

        if (data.State !== undefined) {
          setState(data.State);
        }


        console.log("Received data:", data);
        if (data.Mixer === false) {
          setIsActive(true);
        } else {
          setIsActive(false);
        }

        console.log("Received data:", data);
        if (data.Mixer_gate === false) {
          setMixerGate(true);
        } else {
          setMixerGate(false);
        }
        console.log("Received data:", data);
        if (data.Silo === false) {
          setIsActive1(true);
        } else {
          setIsActive1(false);
        }
        console.log("Received data:", data);
        if (data.Cement_Hopper_gate === false) {
          setIsActive2(true);
        } else {
          setIsActive2(false);
        }
        console.log("Received data:", data);
        if (data.Weighing_conveyor === false) {
          setWeighing_conveyor(true);
        } else {
          setWeighing_conveyor(false);
        }

        //Inclined_conveyor
        console.log("Received data:", data);
        if (data.Inclined_conveyor === false) {
          setInclined_conveyor(true);
        } else {
          setInclined_conveyor(false);
        }

        //water valve
        console.log("Received data:", data);
        if (data.Water_valve === false) {
          setWater_valve(true);
        } else {
          setWater_valve(false);
        }
      },



      error: (error) => console.error("Error:", error),
      complete: () => console.log("Subscription completed"),
    });

    // Check connection state
    Hub.listen("pubsub", (data) => {
      const { payload } = data;
      if (payload.event === CONNECTION_STATE_CHANGE) {
        const connectionState = payload.data.connectionState;
        console.log(connectionState);
      }
    });

    const connectToIoT = async () => {
      try {
        const session = await fetchAuthSession({ forceRefresh: false });
        const id = session.identityId;
        const idToken = session.tokens.idToken.toString();

        const iotClient = new IoTDataPlaneClient({
          region: "eu-north-1",
          credentials: session.credentials,
        });

        const policyClient = new IoTClient({
          region: "eu-north-1",
          credentials: session.credentials,
        });

        const policyInput = {
          policyName: "Amp_Policy",
          target: id,
        };

        const policyCommand = new AttachPolicyCommand(policyInput);
        await policyClient.send(policyCommand);

        const pubTopicName = "esp32/sub";
        const payload = {
          message: "Hello from AWS SDK!",
        };
        const encodedPayload = Buffer.from(JSON.stringify(payload));

        const publishParams = {
          topic: pubTopicName,
          qos: 0,
          payload: encodedPayload,
          retain: false,
        };

        const publishCommand = new PublishCommand(publishParams);
        const data = await iotClient.send(publishCommand);
        console.log("Message published successfully:", data);
        setIsConnected(true);
      } catch (error) {
        console.error("Error authenticating user or getting credentials:", error);
      }
    };

    connectToIoT();
  }, []);

  const publishButton = async () => {
    try {
      const session = await fetchAuthSession({ forceRefresh: false });
      const id = session.identityId;
      const idToken = session.tokens.idToken.toString();

      const cognitoClient = new CognitoIdentityClient({
        region: "eu-north-1",
      });
      const cognitoRequest = {
        IdentityId: id,
        Logins: {
          "cognito-idp.eu-north-1.amazonaws.com/eu-north-1_fbBYQUTeP": idToken,
        },
      };

      const cognitoCommand = new GetCredentialsForIdentityCommand(cognitoRequest);
      const cognitoCreds = await cognitoClient.send(cognitoCommand);

      const iotClient = new IoTDataPlaneClient({
        region: "eu-north-1",
        credentials: {
          accessKeyId: cognitoCreds.Credentials.AccessKeyId,
          secretAccessKey: cognitoCreds.Credentials.SecretKey,
          sessionToken: cognitoCreds.Credentials.SessionToken,
          expiration: cognitoCreds.Credentials.Expiration,
        },
      });

      const pubTopicName = "esp32/sub";
      const payload = {
        message: "Hello from AWS SDK!",
      };
      const encodedPayload = Buffer.from(JSON.stringify(payload));

      const publishParams = {
        topic: pubTopicName,
        qos: 0,
        payload: encodedPayload,
        retain: false,
      };

      const publishCommand = new PublishCommand(publishParams);
      const data = await iotClient.send(publishCommand);
      console.log("Publish to IoT success:", data);
    } catch (err) {
      console.error("Publish to IoT failed:", err);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Authenticator>
              
              {({ signOut, user }) => {
                setIsSignedIn(true);
                return isSignedIn && <Navigate to="/new" replace={true} />;
              }}
            </Authenticator>
          }
        />

        <Route
          path="/new"
          element={
            <div style={{ textAlign: "center", marginTop: "0px" }}>
              <Authenticator>
                {({ signOut, user }) => (
                  <div>
                    
{/*                     
                    <button
                      onClick={signOut}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#FF5733",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Sign Out
                    </button> */}
                    
                    {user.username.toLowerCase() === "merna" && (

                      <Link to="/concrete-mix">
                        <Image
                          src="https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-20_at_1.12.34_AM-removebg-preview.png"
                          alt="Merna Icon"
                          width="32px"
                          height="32px"
                          style={{
                            position: "absolute",
                            top: "1047px",
                            left: "330px",
                            zIndex: 999,
                            objectFit: "cover",
                            cursor: "pointer" // Add this for better UX
                          }}
                        />
                      </Link>

                    )}



                    {user.username.toLowerCase() === "abdulrhman" && (
                      <Link to="/reports">
                        <Image
                          src="https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-20_at_1.10.58_AM-removebg-preview.png"
                          alt="Abdulrhman Icon"
                          width="33px"
                          height="33px"
                          style={{
                            position: "absolute",
                            top: "1047px",
                            left: "330px",
                            zIndex: 1000,
                            objectFit: "cover",
                          }}

                        />
                      </Link>
                    )}

                    
                    <IPhone13141 />
                    <Flex overflow="auto" />
                    <img
                      src={imageUrl}
                      alt="Dynamic IoT"
                      style={{
                        width: "17.33px",
                        height: "19.27px",
                        display: "block",
                        position: "absolute",
                        top: "604px",
                        left: "84.77px",
                        objectFit: "cover",
                        padding: "0px",
                      }}
                    />
                    <img
                      src={imageUrl1}
                      alt="Dynamic IoT"
                      style={{
                        width: "17.33px",
                        height: "19.27px",
                        display: "block",
                        position: "absolute",
                        top: "604px",
                        left: "110px",
                        objectFit: "cover",
                        padding: "0px",
                      }}
                    />

                    {showSecondaryImage && (
                      <img
                        src="https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-22_at_9.25.21_PM-removebg-preview.png"
                        alt="Secondary Dynamic IoT"
                        style={{
                          width: "6.81px",
                          height: "8.93px",
                          position: "absolute",
                          top: "622px",
                          left: "115px",
                          objectFit: "cover",
                          animation: "moveDown 13s ease-in-out forwards",
                        }}
                      />
                    )}
                    {showSecondaryImage1 && (
                      <img
                        src="https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-22_at_9.25.21_PM-removebg-preview.png"
                        alt="Secondary Dynamic IoT"
                        style={{
                          width: "6.81px",
                          height: "8.93px",
                          position: "absolute",
                          top: "622px",
                          left: "90px",
                          objectFit: "cover",
                          animation: "moveDown 13s ease-in-out forwards",
                        }}
                      />
                    )}

                    <button
                      onClick={publishButton}
                      style={{
                        marginTop: "20px",
                        padding: "10px 20px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Publish to IoT
                    </button>
                    <div
                      style={{
                        position: "absolute",
                        top: "649px",
                        left: "114px",
                        fontSize: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      { weight!== null
                        ? `${Number(weight).toFixed(2)} kg`
                        : "Loading..."}
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: "507px",
                        left: "190px",
                        fontSize: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      {Weight_cement !== null
                        ? `${Number(Weight_cement).toFixed(2)} kg`
                        : "Loading..."}
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        top: "730px",
                        left: "328px",
                        fontSize: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      {Weight_water !== null
                        ? `${Number(Weight_water).toFixed(2)} kg`
                        : "Loading..."}
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        top: "975px",
                        left: "48px",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      {State !== null ? `${State} ` : "SCADA"}

                    </div>
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: isActive ? "#E0230D" : "#85CF23",
                        display: "inline-block",
                        //marginTop: "20px",
                        position: "absolute",
                        top: "800px",
                        left: "278px",
                        border: ".000000001px solid rgba(0,0,0,1)"

                      }}
                    />
                    <Icon
                      width="10px"
                      height="10px"

                      viewBox={{
                        minX: 0,
                        minY: 0,
                        width: 10.000001907348633,
                        height: 10.00000286102295,


                      }}
                      paths={[
                        {
                          d: "M10 5L10.5 5L10 5ZM5 2L5 2.5L5 2ZM2 5L2.50001 5L2.5 4.99767L2 5ZM2.61 3.195L3.00608 3.50016L3.01533 3.48815L3.02384 3.4756L2.61 3.195ZM3.4 3.805L3.02384 3.4756L3.01234 3.48873L3.00179 3.50264L3.4 3.805ZM3 5L3.50001 5L3.5 4.99829L3 5ZM5 7L5 7.5L5 7ZM7 5L6.5 4.99829L6.5 5L7 5ZM6.6 3.805L6.18616 4.0856L6.19368 4.09669L6.20179 4.10736L6.6 3.805ZM7.39 3.195L7.78608 2.88984L7.7765 2.87741L7.76617 2.8656L7.39 3.195ZM8 5L7.5 4.99767L7.5 5L8 5ZM5 -0.5C3.91221 -0.5 2.84884 -0.177431 1.94437 0.426917L2.49994 1.25839C3.23996 0.76392 4.10999 0.5 5 0.5L5 -0.5ZM1.94437 0.426917C1.0399 1.03126 0.334947 1.89025 -0.0813352 2.89524L0.842544 3.27792C1.18314 2.45566 1.75991 1.75285 2.49994 1.25839L1.94437 0.426917ZM-0.0813352 2.89524C-0.497617 3.90023 -0.606535 5.0061 -0.394317 6.073L0.586469 5.87791C0.412835 5.00499 0.50195 4.10019 0.842544 3.27792L-0.0813352 2.89524ZM-0.394317 6.073C-0.182098 7.13989 0.341726 8.1199 1.11091 8.88909L1.81802 8.18198C1.18869 7.55264 0.760102 6.75082 0.586469 5.87791L-0.394317 6.073ZM1.11091 8.88909C1.8801 9.65828 2.86011 10.1821 3.92701 10.3943L4.1221 9.41353C3.24918 9.2399 2.44736 8.81132 1.81802 8.18198L1.11091 8.88909ZM3.92701 10.3943C4.9939 10.6065 6.09977 10.4976 7.10476 10.0813L6.72208 9.15746C5.89981 9.49805 4.99501 9.58717 4.1221 9.41353L3.92701 10.3943ZM7.10476 10.0813C8.10976 9.66506 8.96874 8.96011 9.57308 8.05564L8.74161 7.50007C8.24715 8.24009 7.54435 8.81686 6.72208 9.15746L7.10476 10.0813ZM9.57308 8.05564C10.1774 7.15117 10.5 6.0878 10.5 5L9.5 5C9.5 5.89002 9.23608 6.76004 8.74161 7.50007L9.57308 8.05564ZM10.5 5C10.5 4.27773 10.3577 3.56253 10.0813 2.89524L9.15746 3.27792C9.38361 3.82389 9.5 4.40905 9.5 5L10.5 5ZM10.0813 2.89524C9.80494 2.22795 9.39981 1.62163 8.88909 1.11091L8.18198 1.81802C8.59985 2.23588 8.93131 2.73196 9.15746 3.27792L10.0813 2.89524ZM8.88909 1.11091C8.37837 0.600191 7.77205 0.195064 7.10476 -0.0813374L6.72208 0.842542C7.26804 1.06869 7.76412 1.40016 8.18198 1.81802L8.88909 1.11091ZM7.10476 -0.0813374C6.43747 -0.357738 5.72227 -0.5 5 -0.5L5 0.5C5.59095 0.5 6.17611 0.616396 6.72208 0.842542L7.10476 -0.0813374ZM5 2.5L5 2.5L4.2929 1.79289C4.10536 1.98043 4 2.23478 4 2.5L5 2.5ZM5 2.5L5 2.5L5 1.5C4.73479 1.5 4.48043 1.60536 4.2929 1.79289L5 2.5ZM5 2.5L5 2.5L5.70711 1.79289C5.51957 1.60536 5.26522 1.5 5 1.5L5 2.5ZM5 2.5L5 2.5L6 2.5C6 2.23478 5.89465 1.98043 5.70711 1.79289L5 2.5ZM5 2.5L5 2.5L5 4.5L6 4.5L6 2.5L5 2.5ZM5 4.5L5 4.5L5.70711 5.20711C5.89465 5.01957 6 4.76522 6 4.5L5 4.5ZM5 4.5L5 4.5L5 5.5C5.26522 5.5 5.51957 5.39464 5.70711 5.20711L5 4.5ZM5 4.5L5 4.5L4.2929 5.20711C4.48043 5.39464 4.73479 5.5 5 5.5L5 4.5ZM5 4.5L5 4.5L4 4.5C4 4.76522 4.10536 5.01957 4.2929 5.20711L5 4.5ZM5 4.5L5 2.5L4 2.5L4 4.5L5 4.5ZM5 7.5C4.33696 7.5 3.70108 7.23661 3.23224 6.76777L2.52513 7.47487C3.18151 8.13125 4.07174 8.5 5 8.5L5 7.5ZM3.23224 6.76777C2.76339 6.29893 2.5 5.66304 2.5 5L1.5 5C1.5 5.92826 1.86875 6.8185 2.52513 7.47487L3.23224 6.76777ZM2.5 4.99767C2.49747 4.45611 2.67555 3.92916 3.00608 3.50016L2.21393 2.88984C1.74766 3.49502 1.49644 4.23837 1.50001 5.00233L2.5 4.99767ZM3.02384 3.4756L3.02384 3.4756L2.48688 2.632C2.37171 2.7053 2.27278 2.80141 2.19616 2.9144L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L2.86579 2.48817C2.73099 2.50975 2.60204 2.5587 2.48688 2.632L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.27067 2.50655C3.13838 2.47285 3.00059 2.4666 2.86579 2.48817L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.635 2.6841C3.52695 2.60067 3.40296 2.54024 3.27067 2.50655L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.89894 2.99167C3.83288 2.8722 3.74305 2.76753 3.635 2.6841L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L4.01914 3.37873C4.00591 3.24286 3.96501 3.11113 3.89894 2.99167L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.97584 3.7817C4.01763 3.65174 4.03236 3.5146 4.01914 3.37873L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.77617 4.1344C3.8661 4.03169 3.93405 3.91166 3.97584 3.7817L3.02384 3.4756ZM3.00179 3.50264C2.67449 3.93369 2.49816 4.46048 2.50001 5.00171L3.5 4.99829C3.4989 4.67663 3.6037 4.36355 3.79822 4.10736L3.00179 3.50264ZM2.5 5C2.5 5.66304 2.76339 6.29893 3.23224 6.76777L3.93934 6.06066C3.65804 5.77936 3.5 5.39782 3.5 5L2.5 5ZM3.23224 6.76777C3.70108 7.23661 4.33696 7.5 5 7.5L5 6.5C4.60218 6.5 4.22065 6.34196 3.93934 6.06066L3.23224 6.76777ZM5 7.5C5.66304 7.5 6.29893 7.23661 6.76777 6.76777L6.06066 6.06066C5.77936 6.34196 5.39783 6.5 5 6.5L5 7.5ZM6.76777 6.76777C7.23661 6.29893 7.5 5.66304 7.5 5L6.5 5C6.5 5.39782 6.34197 5.77936 6.06066 6.06066L6.76777 6.76777ZM7.5 5.00171C7.50185 4.46048 7.32552 3.93369 6.99822 3.50264L6.20179 4.10736C6.39631 4.36355 6.5011 4.67663 6.50001 4.99829L7.5 5.00171ZM7.01384 3.5244L7.01384 3.5244L6.02641 3.36635C5.98618 3.6177 6.04331 3.87492 6.18616 4.0856L7.01384 3.5244ZM7.01384 3.5244L7.01384 3.5244L6.40268 2.73289C6.2012 2.88846 6.06664 3.115 6.02641 3.36635L7.01384 3.5244ZM7.01384 3.5244L7.01384 3.5244L7.11072 2.5291C6.85737 2.50444 6.60415 2.57732 6.40268 2.73289L7.01384 3.5244ZM7.01384 3.5244L7.01384 3.5244L7.76617 2.8656C7.59847 2.6741 7.36406 2.55376 7.11072 2.5291L7.01384 3.5244ZM6.99393 3.50016C7.32445 3.92916 7.50254 4.45611 7.50001 4.99767L8.5 5.00233C8.50356 4.23837 8.25235 3.49502 7.78608 2.88984L6.99393 3.50016ZM7.5 5C7.5 5.66304 7.23661 6.29893 6.76777 6.76777L7.47488 7.47487C8.13125 6.8185 8.5 5.92826 8.5 5L7.5 5ZM6.76777 6.76777C6.29893 7.23661 5.66304 7.5 5 7.5L5 8.5C5.92826 8.5 6.8185 8.13125 7.47488 7.47487L6.76777 6.76777Z",
                          stroke: "rgba(0,0,0,1)",
                          fillRule: "nonzero",
                          strokeWidth: 0,


                        },
                        {
                          d: "M5 0C4.0111 -2.22045e-16 3.0444 0.293245 2.22215 0.842652C1.39991 1.39206 0.759043 2.17295 0.380605 3.08658C0.00216642 4.00021 -0.0968503 5.00555 0.0960759 5.97545C0.289002 6.94536 0.765206 7.83627 1.46447 8.53553C2.16373 9.2348 3.05465 9.711 4.02455 9.90393C4.99446 10.0969 5.99979 9.99784 6.91342 9.6194C7.82705 9.24096 8.60794 8.6001 9.15735 7.77785C9.70676 6.95561 10 5.98891 10 5C10 4.34339 9.87067 3.69321 9.6194 3.08658C9.36813 2.47995 8.99983 1.92876 8.53554 1.46447C8.07124 1.00017 7.52005 0.631876 6.91342 0.380602C6.30679 0.129329 5.65661 6.66134e-16 5 0ZM4.5 2.5C4.5 2.36739 4.55268 2.24021 4.64645 2.14645C4.74022 2.05268 4.86739 2 5 2C5.13261 2 5.25979 2.05268 5.35356 2.14645C5.44732 2.24021 5.5 2.36739 5.5 2.5L5.5 4.5C5.5 4.63261 5.44732 4.75979 5.35356 4.85355C5.25979 4.94732 5.13261 5 5 5C4.86739 5 4.74022 4.94732 4.64645 4.85355C4.55268 4.75979 4.5 4.63261 4.5 4.5L4.5 2.5ZM5 8C4.20435 8 3.44129 7.68393 2.87868 7.12132C2.31607 6.55871 2 5.79565 2 5C1.99695 4.34724 2.2116 3.71209 2.61 3.195C2.64831 3.13851 2.69778 3.09045 2.75536 3.0538C2.81294 3.01715 2.87742 2.99268 2.94482 2.98189C3.01222 2.9711 3.08111 2.97423 3.14725 2.99107C3.2134 3.00792 3.27539 3.03814 3.32942 3.07985C3.38345 3.12157 3.42836 3.1739 3.46139 3.23364C3.49442 3.29337 3.51487 3.35923 3.52149 3.42717C3.5281 3.4951 3.52073 3.56367 3.49984 3.62865C3.47895 3.69363 3.44497 3.75365 3.4 3.805C3.13909 4.14862 2.99853 4.56856 3 5C3 5.53043 3.21072 6.03914 3.58579 6.41421C3.96086 6.78929 4.46957 7 5 7C5.53044 7 6.03914 6.78929 6.41422 6.41421C6.78929 6.03914 7 5.53043 7 5C7.00148 4.56856 6.86091 4.14862 6.6 3.805C6.52858 3.69966 6.50001 3.57105 6.52012 3.44537C6.54024 3.3197 6.60752 3.20643 6.70826 3.12864C6.809 3.05086 6.9356 3.01442 7.06228 3.02675C7.18895 3.03908 7.30616 3.09925 7.39 3.195C7.7884 3.71209 8.00305 4.34724 8 5C8 5.79565 7.68393 6.55871 7.12132 7.12132C6.55871 7.68393 5.79565 8 5 8Z",
                          // Use the dynamic color here
                          fill: mixerGateColor,
                          fillRule: "nonzero",
                        },
                      ]}
                      display="block"
                      gap="unset"
                      alignItems="unset"
                      justifyContent="unset"
                      shrink="0"
                      style={{
                        position: "absolute",
                        top: "810px",
                        left: "220px",
                      }}
                    />


                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: isActive1 ? "#E0230D" : "#85CF23",
                        display: "inline-block",
                        //marginTop: "20px",
                        position: "absolute",
                        top: "267px",
                        left: "236px",
                        border: ".000000001px solid rgba(0,0,0,1)"

                      }}
                    />
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: isActive2 ? "#E0230D" : "#85CF23",
                        display: "inline-block",
                        //marginTop: "20px",
                        position: "absolute",
                        top: "440px",
                        left: "193px",
                        border: ".000000001px solid rgba(0,0,0,1)"

                      }}
                    />
                    <Icon
                      width="10px"
                      height="10px"

                      viewBox={{
                        minX: 0,
                        minY: 0,
                        width: 10.000001907348633,
                        height: 10.00000286102295,


                      }}
                      paths={[
                        {
                          d: "M10 5L10.5 5L10 5ZM5 2L5 2.5L5 2ZM2 5L2.50001 5L2.5 4.99767L2 5ZM2.61 3.195L3.00608 3.50016L3.01533 3.48815L3.02384 3.4756L2.61 3.195ZM3.4 3.805L3.02384 3.4756L3.01234 3.48873L3.00179 3.50264L3.4 3.805ZM3 5L3.50001 5L3.5 4.99829L3 5ZM5 7L5 7.5L5 7ZM7 5L6.5 4.99829L6.5 5L7 5ZM6.6 3.805L6.18616 4.0856L6.19368 4.09669L6.20179 4.10736L6.6 3.805ZM7.39 3.195L7.78608 2.88984L7.7765 2.87741L7.76617 2.8656L7.39 3.195ZM8 5L7.5 4.99767L7.5 5L8 5ZM5 -0.5C3.91221 -0.5 2.84884 -0.177431 1.94437 0.426917L2.49994 1.25839C3.23996 0.76392 4.10999 0.5 5 0.5L5 -0.5ZM1.94437 0.426917C1.0399 1.03126 0.334947 1.89025 -0.0813352 2.89524L0.842544 3.27792C1.18314 2.45566 1.75991 1.75285 2.49994 1.25839L1.94437 0.426917ZM-0.0813352 2.89524C-0.497617 3.90023 -0.606535 5.0061 -0.394317 6.073L0.586469 5.87791C0.412835 5.00499 0.50195 4.10019 0.842544 3.27792L-0.0813352 2.89524ZM-0.394317 6.073C-0.182098 7.13989 0.341726 8.1199 1.11091 8.88909L1.81802 8.18198C1.18869 7.55264 0.760102 6.75082 0.586469 5.87791L-0.394317 6.073ZM1.11091 8.88909C1.8801 9.65828 2.86011 10.1821 3.92701 10.3943L4.1221 9.41353C3.24918 9.2399 2.44736 8.81132 1.81802 8.18198L1.11091 8.88909ZM3.92701 10.3943C4.9939 10.6065 6.09977 10.4976 7.10476 10.0813L6.72208 9.15746C5.89981 9.49805 4.99501 9.58717 4.1221 9.41353L3.92701 10.3943ZM7.10476 10.0813C8.10976 9.66506 8.96874 8.96011 9.57308 8.05564L8.74161 7.50007C8.24715 8.24009 7.54435 8.81686 6.72208 9.15746L7.10476 10.0813ZM9.57308 8.05564C10.1774 7.15117 10.5 6.0878 10.5 5L9.5 5C9.5 5.89002 9.23608 6.76004 8.74161 7.50007L9.57308 8.05564ZM10.5 5C10.5 4.27773 10.3577 3.56253 10.0813 2.89524L9.15746 3.27792C9.38361 3.82389 9.5 4.40905 9.5 5L10.5 5ZM10.0813 2.89524C9.80494 2.22795 9.39981 1.62163 8.88909 1.11091L8.18198 1.81802C8.59985 2.23588 8.93131 2.73196 9.15746 3.27792L10.0813 2.89524ZM8.88909 1.11091C8.37837 0.600191 7.77205 0.195064 7.10476 -0.0813374L6.72208 0.842542C7.26804 1.06869 7.76412 1.40016 8.18198 1.81802L8.88909 1.11091ZM7.10476 -0.0813374C6.43747 -0.357738 5.72227 -0.5 5 -0.5L5 0.5C5.59095 0.5 6.17611 0.616396 6.72208 0.842542L7.10476 -0.0813374ZM5 2.5L5 2.5L4.2929 1.79289C4.10536 1.98043 4 2.23478 4 2.5L5 2.5ZM5 2.5L5 2.5L5 1.5C4.73479 1.5 4.48043 1.60536 4.2929 1.79289L5 2.5ZM5 2.5L5 2.5L5.70711 1.79289C5.51957 1.60536 5.26522 1.5 5 1.5L5 2.5ZM5 2.5L5 2.5L6 2.5C6 2.23478 5.89465 1.98043 5.70711 1.79289L5 2.5ZM5 2.5L5 2.5L5 4.5L6 4.5L6 2.5L5 2.5ZM5 4.5L5 4.5L5.70711 5.20711C5.89465 5.01957 6 4.76522 6 4.5L5 4.5ZM5 4.5L5 4.5L5 5.5C5.26522 5.5 5.51957 5.39464 5.70711 5.20711L5 4.5ZM5 4.5L5 4.5L4.2929 5.20711C4.48043 5.39464 4.73479 5.5 5 5.5L5 4.5ZM5 4.5L5 4.5L4 4.5C4 4.76522 4.10536 5.01957 4.2929 5.20711L5 4.5ZM5 4.5L5 2.5L4 2.5L4 4.5L5 4.5ZM5 7.5C4.33696 7.5 3.70108 7.23661 3.23224 6.76777L2.52513 7.47487C3.18151 8.13125 4.07174 8.5 5 8.5L5 7.5ZM3.23224 6.76777C2.76339 6.29893 2.5 5.66304 2.5 5L1.5 5C1.5 5.92826 1.86875 6.8185 2.52513 7.47487L3.23224 6.76777ZM2.5 4.99767C2.49747 4.45611 2.67555 3.92916 3.00608 3.50016L2.21393 2.88984C1.74766 3.49502 1.49644 4.23837 1.50001 5.00233L2.5 4.99767ZM3.02384 3.4756L3.02384 3.4756L2.48688 2.632C2.37171 2.7053 2.27278 2.80141 2.19616 2.9144L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L2.86579 2.48817C2.73099 2.50975 2.60204 2.5587 2.48688 2.632L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.27067 2.50655C3.13838 2.47285 3.00059 2.4666 2.86579 2.48817L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.635 2.6841C3.52695 2.60067 3.40296 2.54024 3.27067 2.50655L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.89894 2.99167C3.83288 2.8722 3.74305 2.76753 3.635 2.6841L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L4.01914 3.37873C4.00591 3.24286 3.96501 3.11113 3.89894 2.99167L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.97584 3.7817C4.01763 3.65174 4.03236 3.5146 4.01914 3.37873L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.77617 4.1344C3.8661 4.03169 3.93405 3.91166 3.97584 3.7817L3.02384 3.4756ZM3.00179 3.50264C2.67449 3.93369 2.49816 4.46048 2.50001 5.00171L3.5 4.99829C3.4989 4.67663 3.6037 4.36355 3.79822 4.10736L3.00179 3.50264ZM2.5 5C2.5 5.66304 2.76339 6.29893 3.23224 6.76777L3.93934 6.06066C3.65804 5.77936 3.5 5.39782 3.5 5L2.5 5ZM3.23224 6.76777C3.70108 7.23661 4.33696 7.5 5 7.5L5 6.5C4.60218 6.5 4.22065 6.34196 3.93934 6.06066L3.23224 6.76777ZM5 7.5C5.66304 7.5 6.29893 7.23661 6.76777 6.76777L6.06066 6.06066C5.77936 6.34196 5.39783 6.5 5 6.5L5 7.5ZM6.76777 6.76777C7.23661 6.29893 7.5 5.66304 7.5 5L6.5 5C6.5 5.39782 6.34197 5.77936 6.06066 6.06066L6.76777 6.76777ZM7.5 5.00171C7.50185 4.46048 7.32552 3.93369 6.99822 3.50264L6.20179 4.10736C6.39631 4.36355 6.5011 4.67663 6.50001 4.99829L7.5 5.00171ZM7.01384 3.5244L7.01384 3.5244L6.02641 3.36635C5.98618 3.6177 6.04331 3.87492 6.18616 4.0856L7.01384 3.5244ZM7.01384 3.5244L7.01384 3.5244L6.40268 2.73289C6.2012 2.88846 6.06664 3.115 6.02641 3.36635L7.01384 3.5244ZM7.01384 3.5244L7.01384 3.5244L7.11072 2.5291C6.85737 2.50444 6.60415 2.57732 6.40268 2.73289L7.01384 3.5244ZM7.01384 3.5244L7.01384 3.5244L7.76617 2.8656C7.59847 2.6741 7.36406 2.55376 7.11072 2.5291L7.01384 3.5244ZM6.99393 3.50016C7.32445 3.92916 7.50254 4.45611 7.50001 4.99767L8.5 5.00233C8.50356 4.23837 8.25235 3.49502 7.78608 2.88984L6.99393 3.50016ZM7.5 5C7.5 5.66304 7.23661 6.29893 6.76777 6.76777L7.47488 7.47487C8.13125 6.8185 8.5 5.92826 8.5 5L7.5 5ZM6.76777 6.76777C6.29893 7.23661 5.66304 7.5 5 7.5L5 8.5C5.92826 8.5 6.8185 8.13125 7.47488 7.47487L6.76777 6.76777Z",
                          stroke: "rgba(0,0,0,1)",
                          fillRule: "nonzero",
                          strokeWidth: 0,


                        },
                        {
                          d: "M5 0C4.0111 -2.22045e-16 3.0444 0.293245 2.22215 0.842652C1.39991 1.39206 0.759043 2.17295 0.380605 3.08658C0.00216642 4.00021 -0.0968503 5.00555 0.0960759 5.97545C0.289002 6.94536 0.765206 7.83627 1.46447 8.53553C2.16373 9.2348 3.05465 9.711 4.02455 9.90393C4.99446 10.0969 5.99979 9.99784 6.91342 9.6194C7.82705 9.24096 8.60794 8.6001 9.15735 7.77785C9.70676 6.95561 10 5.98891 10 5C10 4.34339 9.87067 3.69321 9.6194 3.08658C9.36813 2.47995 8.99983 1.92876 8.53554 1.46447C8.07124 1.00017 7.52005 0.631876 6.91342 0.380602C6.30679 0.129329 5.65661 6.66134e-16 5 0ZM4.5 2.5C4.5 2.36739 4.55268 2.24021 4.64645 2.14645C4.74022 2.05268 4.86739 2 5 2C5.13261 2 5.25979 2.05268 5.35356 2.14645C5.44732 2.24021 5.5 2.36739 5.5 2.5L5.5 4.5C5.5 4.63261 5.44732 4.75979 5.35356 4.85355C5.25979 4.94732 5.13261 5 5 5C4.86739 5 4.74022 4.94732 4.64645 4.85355C4.55268 4.75979 4.5 4.63261 4.5 4.5L4.5 2.5ZM5 8C4.20435 8 3.44129 7.68393 2.87868 7.12132C2.31607 6.55871 2 5.79565 2 5C1.99695 4.34724 2.2116 3.71209 2.61 3.195C2.64831 3.13851 2.69778 3.09045 2.75536 3.0538C2.81294 3.01715 2.87742 2.99268 2.94482 2.98189C3.01222 2.9711 3.08111 2.97423 3.14725 2.99107C3.2134 3.00792 3.27539 3.03814 3.32942 3.07985C3.38345 3.12157 3.42836 3.1739 3.46139 3.23364C3.49442 3.29337 3.51487 3.35923 3.52149 3.42717C3.5281 3.4951 3.52073 3.56367 3.49984 3.62865C3.47895 3.69363 3.44497 3.75365 3.4 3.805C3.13909 4.14862 2.99853 4.56856 3 5C3 5.53043 3.21072 6.03914 3.58579 6.41421C3.96086 6.78929 4.46957 7 5 7C5.53044 7 6.03914 6.78929 6.41422 6.41421C6.78929 6.03914 7 5.53043 7 5C7.00148 4.56856 6.86091 4.14862 6.6 3.805C6.52858 3.69966 6.50001 3.57105 6.52012 3.44537C6.54024 3.3197 6.60752 3.20643 6.70826 3.12864C6.809 3.05086 6.9356 3.01442 7.06228 3.02675C7.18895 3.03908 7.30616 3.09925 7.39 3.195C7.7884 3.71209 8.00305 4.34724 8 5C8 5.79565 7.68393 6.55871 7.12132 7.12132C6.55871 7.68393 5.79565 8 5 8Z",
                          // Use the dynamic color here
                          fill: Weighing_conveyorColor,
                          fillRule: "nonzero",
                        },
                      ]}
                      display="block"
                      gap="unset"
                      alignItems="unset"
                      justifyContent="unset"
                      shrink="0"
                      style={{
                        position: "absolute",
                        top: "635px",
                        left: "123px",
                      }}
                    />


                    <Icon
                      width="7px"
                      height="7px"

                      viewBox={{
                        minX: 0,
                        minY: 0,
                        width: 10.000001907348633,
                        height: 10.00000286102295,


                      }}
                      paths={[
                        {
                          d: "M10 5L10.5 5L10 5ZM5 2L5 2.5L5 2ZM2 5L2.50001 5L2.5 4.99767L2 5ZM2.61 3.195L3.00608 3.50016L3.01533 3.48815L3.02384 3.4756L2.61 3.195ZM3.4 3.805L3.02384 3.4756L3.01234 3.48873L3.00179 3.50264L3.4 3.805ZM3 5L3.50001 5L3.5 4.99829L3 5ZM5 7L5 7.5L5 7ZM7 5L6.5 4.99829L6.5 5L7 5ZM6.6 3.805L6.18616 4.0856L6.19368 4.09669L6.20179 4.10736L6.6 3.805ZM7.39 3.195L7.78608 2.88984L7.7765 2.87741L7.76617 2.8656L7.39 3.195ZM8 5L7.5 4.99767L7.5 5L8 5ZM5 -0.5C3.91221 -0.5 2.84884 -0.177431 1.94437 0.426917L2.49994 1.25839C3.23996 0.76392 4.10999 0.5 5 0.5L5 -0.5ZM1.94437 0.426917C1.0399 1.03126 0.334947 1.89025 -0.0813352 2.89524L0.842544 3.27792C1.18314 2.45566 1.75991 1.75285 2.49994 1.25839L1.94437 0.426917ZM-0.0813352 2.89524C-0.497617 3.90023 -0.606535 5.0061 -0.394317 6.073L0.586469 5.87791C0.412835 5.00499 0.50195 4.10019 0.842544 3.27792L-0.0813352 2.89524ZM-0.394317 6.073C-0.182098 7.13989 0.341726 8.1199 1.11091 8.88909L1.81802 8.18198C1.18869 7.55264 0.760102 6.75082 0.586469 5.87791L-0.394317 6.073ZM1.11091 8.88909C1.8801 9.65828 2.86011 10.1821 3.92701 10.3943L4.1221 9.41353C3.24918 9.2399 2.44736 8.81132 1.81802 8.18198L1.11091 8.88909ZM3.92701 10.3943C4.9939 10.6065 6.09977 10.4976 7.10476 10.0813L6.72208 9.15746C5.89981 9.49805 4.99501 9.58717 4.1221 9.41353L3.92701 10.3943ZM7.10476 10.0813C8.10976 9.66506 8.96874 8.96011 9.57308 8.05564L8.74161 7.50007C8.24715 8.24009 7.54435 8.81686 6.72208 9.15746L7.10476 10.0813ZM9.57308 8.05564C10.1774 7.15117 10.5 6.0878 10.5 5L9.5 5C9.5 5.89002 9.23608 6.76004 8.74161 7.50007L9.57308 8.05564ZM10.5 5C10.5 4.27773 10.3577 3.56253 10.0813 2.89524L9.15746 3.27792C9.38361 3.82389 9.5 4.40905 9.5 5L10.5 5ZM10.0813 2.89524C9.80494 2.22795 9.39981 1.62163 8.88909 1.11091L8.18198 1.81802C8.59985 2.23588 8.93131 2.73196 9.15746 3.27792L10.0813 2.89524ZM8.88909 1.11091C8.37837 0.600191 7.77205 0.195064 7.10476 -0.0813374L6.72208 0.842542C7.26804 1.06869 7.76412 1.40016 8.18198 1.81802L8.88909 1.11091ZM7.10476 -0.0813374C6.43747 -0.357738 5.72227 -0.5 5 -0.5L5 0.5C5.59095 0.5 6.17611 0.616396 6.72208 0.842542L7.10476 -0.0813374ZM5 2.5L5 2.5L4.2929 1.79289C4.10536 1.98043 4 2.23478 4 2.5L5 2.5ZM5 2.5L5 2.5L5 1.5C4.73479 1.5 4.48043 1.60536 4.2929 1.79289L5 2.5ZM5 2.5L5 2.5L5.70711 1.79289C5.51957 1.60536 5.26522 1.5 5 1.5L5 2.5ZM5 2.5L5 2.5L6 2.5C6 2.23478 5.89465 1.98043 5.70711 1.79289L5 2.5ZM5 2.5L5 2.5L5 4.5L6 4.5L6 2.5L5 2.5ZM5 4.5L5 4.5L5.70711 5.20711C5.89465 5.01957 6 4.76522 6 4.5L5 4.5ZM5 4.5L5 4.5L5 5.5C5.26522 5.5 5.51957 5.39464 5.70711 5.20711L5 4.5ZM5 4.5L5 4.5L4.2929 5.20711C4.48043 5.39464 4.73479 5.5 5 5.5L5 4.5ZM5 4.5L5 4.5L4 4.5C4 4.76522 4.10536 5.01957 4.2929 5.20711L5 4.5ZM5 4.5L5 2.5L4 2.5L4 4.5L5 4.5ZM5 7.5C4.33696 7.5 3.70108 7.23661 3.23224 6.76777L2.52513 7.47487C3.18151 8.13125 4.07174 8.5 5 8.5L5 7.5ZM3.23224 6.76777C2.76339 6.29893 2.5 5.66304 2.5 5L1.5 5C1.5 5.92826 1.86875 6.8185 2.52513 7.47487L3.23224 6.76777ZM2.5 4.99767C2.49747 4.45611 2.67555 3.92916 3.00608 3.50016L2.21393 2.88984C1.74766 3.49502 1.49644 4.23837 1.50001 5.00233L2.5 4.99767ZM3.02384 3.4756L3.02384 3.4756L2.48688 2.632C2.37171 2.7053 2.27278 2.80141 2.19616 2.9144L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L2.86579 2.48817C2.73099 2.50975 2.60204 2.5587 2.48688 2.632L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.27067 2.50655C3.13838 2.47285 3.00059 2.4666 2.86579 2.48817L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.635 2.6841C3.52695 2.60067 3.40296 2.54024 3.27067 2.50655L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.89894 2.99167C3.83288 2.8722 3.74305 2.76753 3.635 2.6841L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L4.01914 3.37873C4.00591 3.24286 3.96501 3.11113 3.89894 2.99167L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.97584 3.7817C4.01763 3.65174 4.03236 3.5146 4.01914 3.37873L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.77617 4.1344C3.8661 4.03169 3.93405 3.91166 3.97584 3.7817L3.02384 3.4756ZM3.00179 3.50264C2.67449 3.93369 2.49816 4.46048 2.50001 5.00171L3.5 4.99829C3.4989 4.67663 3.6037 4.36355 3.79822 4.10736L3.00179 3.50264ZM2.5 5C2.5 5.66304 2.76339 6.29893 3.23224 6.76777L3.93934 6.06066C3.65804 5.77936 3.5 5.39782 3.5 5L2.5 5ZM3.23224 6.76777C3.70108 7.23661 4.33696 7.5 5 7.5L5 6.5C4.60218 6.5 4.22065 6.34196 3.93934 6.06066L3.23224 6.76777ZM5 7.5C5.66304 7.5 6.29893 7.23661 6.76777 6.76777L6.06066 6.06066C5.77936 6.34196 5.39783 6.5 5 6.5L5 7.5ZM6.76777 6.76777C7.23661 6.29893 7.5 5.66304 7.5 5L6.5 5C6.5 5.39782 6.34197 5.77936 6.06066 6.06066L6.76777 6.76777ZM7.5 5.00171C7.50185 4.46048 7.32552 3.93369 6.99822 3.50264L6.20179 4.10736C6.39631 4.36355 6.5011 4.67663 6.50001 4.99829L7.5 5.00171ZM7.01384 3.5244L7.01384 3.5244L6.02641 3.36635C5.98618 3.6177 6.04331 3.87492 6.18616 4.0856L7.01384 3.5244ZM7.01384 3.5244L7.01384 3.5244L6.40268 2.73289C6.2012 2.88846 6.06664 3.115 6.02641 3.36635L7.01384 3.5244ZM7.01384 3.5244L7.01384 3.5244L7.11072 2.5291C6.85737 2.50444 6.60415 2.57732 6.40268 2.73289L7.01384 3.5244ZM7.01384 3.5244L7.01384 3.5244L7.76617 2.8656C7.59847 2.6741 7.36406 2.55376 7.11072 2.5291L7.01384 3.5244ZM6.99393 3.50016C7.32445 3.92916 7.50254 4.45611 7.50001 4.99767L8.5 5.00233C8.50356 4.23837 8.25235 3.49502 7.78608 2.88984L6.99393 3.50016ZM7.5 5C7.5 5.66304 7.23661 6.29893 6.76777 6.76777L7.47488 7.47487C8.13125 6.8185 8.5 5.92826 8.5 5L7.5 5ZM6.76777 6.76777C6.29893 7.23661 5.66304 7.5 5 7.5L5 8.5C5.92826 8.5 6.8185 8.13125 7.47488 7.47487L6.76777 6.76777Z",
                          stroke: "rgba(0,0,0,1)",
                          fillRule: "nonzero",
                          strokeWidth: 0,


                        },
                        {
                          d: "M5 0C4.0111 -2.22045e-16 3.0444 0.293245 2.22215 0.842652C1.39991 1.39206 0.759043 2.17295 0.380605 3.08658C0.00216642 4.00021 -0.0968503 5.00555 0.0960759 5.97545C0.289002 6.94536 0.765206 7.83627 1.46447 8.53553C2.16373 9.2348 3.05465 9.711 4.02455 9.90393C4.99446 10.0969 5.99979 9.99784 6.91342 9.6194C7.82705 9.24096 8.60794 8.6001 9.15735 7.77785C9.70676 6.95561 10 5.98891 10 5C10 4.34339 9.87067 3.69321 9.6194 3.08658C9.36813 2.47995 8.99983 1.92876 8.53554 1.46447C8.07124 1.00017 7.52005 0.631876 6.91342 0.380602C6.30679 0.129329 5.65661 6.66134e-16 5 0ZM4.5 2.5C4.5 2.36739 4.55268 2.24021 4.64645 2.14645C4.74022 2.05268 4.86739 2 5 2C5.13261 2 5.25979 2.05268 5.35356 2.14645C5.44732 2.24021 5.5 2.36739 5.5 2.5L5.5 4.5C5.5 4.63261 5.44732 4.75979 5.35356 4.85355C5.25979 4.94732 5.13261 5 5 5C4.86739 5 4.74022 4.94732 4.64645 4.85355C4.55268 4.75979 4.5 4.63261 4.5 4.5L4.5 2.5ZM5 8C4.20435 8 3.44129 7.68393 2.87868 7.12132C2.31607 6.55871 2 5.79565 2 5C1.99695 4.34724 2.2116 3.71209 2.61 3.195C2.64831 3.13851 2.69778 3.09045 2.75536 3.0538C2.81294 3.01715 2.87742 2.99268 2.94482 2.98189C3.01222 2.9711 3.08111 2.97423 3.14725 2.99107C3.2134 3.00792 3.27539 3.03814 3.32942 3.07985C3.38345 3.12157 3.42836 3.1739 3.46139 3.23364C3.49442 3.29337 3.51487 3.35923 3.52149 3.42717C3.5281 3.4951 3.52073 3.56367 3.49984 3.62865C3.47895 3.69363 3.44497 3.75365 3.4 3.805C3.13909 4.14862 2.99853 4.56856 3 5C3 5.53043 3.21072 6.03914 3.58579 6.41421C3.96086 6.78929 4.46957 7 5 7C5.53044 7 6.03914 6.78929 6.41422 6.41421C6.78929 6.03914 7 5.53043 7 5C7.00148 4.56856 6.86091 4.14862 6.6 3.805C6.52858 3.69966 6.50001 3.57105 6.52012 3.44537C6.54024 3.3197 6.60752 3.20643 6.70826 3.12864C6.809 3.05086 6.9356 3.01442 7.06228 3.02675C7.18895 3.03908 7.30616 3.09925 7.39 3.195C7.7884 3.71209 8.00305 4.34724 8 5C8 5.79565 7.68393 6.55871 7.12132 7.12132C6.55871 7.68393 5.79565 8 5 8Z",
                          // Use the dynamic color here
                          fill: Inclined_conveyorColor,
                          fillRule: "nonzero",
                        },
                      ]}
                      display="block"
                      gap="unset"
                      alignItems="unset"
                      justifyContent="unset"
                      shrink="0"
                      style={{
                        position: "absolute",
                        top: "620px",
                        left: "150px",
                      }} // for water valve elle gayy 
                    />
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: Water_valve ? "#E0230D" : "#85CF23",
                        display: "inline-block",
                        //marginTop: "20px",
                        position: "absolute",
                        top: "800px",
                        left: "278px",
                        border: ".000000001px solid rgba(0,0,0,1)"

                      }}
                    />
                    <Icon
                      width="10px"
                      height="10px"

                      viewBox={{
                        minX: 0,
                        minY: 0,
                        width: 10.000001907348633,
                        height: 10.00000286102295,


                      }}
                      paths={[
                        {
                          d: "M10 5L10.5 5L10 5ZM5 2L5 2.5L5 2ZM2 5L2.50001 5L2.5 4.99767L2 5ZM2.61 3.195L3.00608 3.50016L3.01533 3.48815L3.02384 3.4756L2.61 3.195ZM3.4 3.805L3.02384 3.4756L3.01234 3.48873L3.00179 3.50264L3.4 3.805ZM3 5L3.50001 5L3.5 4.99829L3 5ZM5 7L5 7.5L5 7ZM7 5L6.5 4.99829L6.5 5L7 5ZM6.6 3.805L6.18616 4.0856L6.19368 4.09669L6.20179 4.10736L6.6 3.805ZM7.39 3.195L7.78608 2.88984L7.7765 2.87741L7.76617 2.8656L7.39 3.195ZM8 5L7.5 4.99767L7.5 5L8 5ZM5 -0.5C3.91221 -0.5 2.84884 -0.177431 1.94437 0.426917L2.49994 1.25839C3.23996 0.76392 4.10999 0.5 5 0.5L5 -0.5ZM1.94437 0.426917C1.0399 1.03126 0.334947 1.89025 -0.0813352 2.89524L0.842544 3.27792C1.18314 2.45566 1.75991 1.75285 2.49994 1.25839L1.94437 0.426917ZM-0.0813352 2.89524C-0.497617 3.90023 -0.606535 5.0061 -0.394317 6.073L0.586469 5.87791C0.412835 5.00499 0.50195 4.10019 0.842544 3.27792L-0.0813352 2.89524ZM-0.394317 6.073C-0.182098 7.13989 0.341726 8.1199 1.11091 8.88909L1.81802 8.18198C1.18869 7.55264 0.760102 6.75082 0.586469 5.87791L-0.394317 6.073ZM1.11091 8.88909C1.8801 9.65828 2.86011 10.1821 3.92701 10.3943L4.1221 9.41353C3.24918 9.2399 2.44736 8.81132 1.81802 8.18198L1.11091 8.88909ZM3.92701 10.3943C4.9939 10.6065 6.09977 10.4976 7.10476 10.0813L6.72208 9.15746C5.89981 9.49805 4.99501 9.58717 4.1221 9.41353L3.92701 10.3943ZM7.10476 10.0813C8.10976 9.66506 8.96874 8.96011 9.57308 8.05564L8.74161 7.50007C8.24715 8.24009 7.54435 8.81686 6.72208 9.15746L7.10476 10.0813ZM9.57308 8.05564C10.1774 7.15117 10.5 6.0878 10.5 5L9.5 5C9.5 5.89002 9.23608 6.76004 8.74161 7.50007L9.57308 8.05564ZM10.5 5C10.5 4.27773 10.3577 3.56253 10.0813 2.89524L9.15746 3.27792C9.38361 3.82389 9.5 4.40905 9.5 5L10.5 5ZM10.0813 2.89524C9.80494 2.22795 9.39981 1.62163 8.88909 1.11091L8.18198 1.81802C8.59985 2.23588 8.93131 2.73196 9.15746 3.27792L10.0813 2.89524ZM8.88909 1.11091C8.37837 0.600191 7.77205 0.195064 7.10476 -0.0813374L6.72208 0.842542C7.26804 1.06869 7.76412 1.40016 8.18198 1.81802L8.88909 1.11091ZM7.10476 -0.0813374C6.43747 -0.357738 5.72227 -0.5 5 -0.5L5 0.5C5.59095 0.5 6.17611 0.616396 6.72208 0.842542L7.10476 -0.0813374ZM5 2.5L5 2.5L4.2929 1.79289C4.10536 1.98043 4 2.23478 4 2.5L5 2.5ZM5 2.5L5 2.5L5 1.5C4.73479 1.5 4.48043 1.60536 4.2929 1.79289L5 2.5ZM5 2.5L5 2.5L5.70711 1.79289C5.51957 1.60536 5.26522 1.5 5 1.5L5 2.5ZM5 2.5L5 2.5L6 2.5C6 2.23478 5.89465 1.98043 5.70711 1.79289L5 2.5ZM5 2.5L5 2.5L5 4.5L6 4.5L6 2.5L5 2.5ZM5 4.5L5 4.5L5.70711 5.20711C5.89465 5.01957 6 4.76522 6 4.5L5 4.5ZM5 4.5L5 4.5L5 5.5C5.26522 5.5 5.51957 5.39464 5.70711 5.20711L5 4.5ZM5 4.5L5 4.5L4.2929 5.20711C4.48043 5.39464 4.73479 5.5 5 5.5L5 4.5ZM5 4.5L5 4.5L4 4.5C4 4.76522 4.10536 5.01957 4.2929 5.20711L5 4.5ZM5 4.5L5 2.5L4 2.5L4 4.5L5 4.5ZM5 7.5C4.33696 7.5 3.70108 7.23661 3.23224 6.76777L2.52513 7.47487C3.18151 8.13125 4.07174 8.5 5 8.5L5 7.5ZM3.23224 6.76777C2.76339 6.29893 2.5 5.66304 2.5 5L1.5 5C1.5 5.92826 1.86875 6.8185 2.52513 7.47487L3.23224 6.76777ZM2.5 4.99767C2.49747 4.45611 2.67555 3.92916 3.00608 3.50016L2.21393 2.88984C1.74766 3.49502 1.49644 4.23837 1.50001 5.00233L2.5 4.99767ZM3.02384 3.4756L3.02384 3.4756L2.48688 2.632C2.37171 2.7053 2.27278 2.80141 2.19616 2.9144L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L2.86579 2.48817C2.73099 2.50975 2.60204 2.5587 2.48688 2.632L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.27067 2.50655C3.13838 2.47285 3.00059 2.4666 2.86579 2.48817L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.635 2.6841C3.52695 2.60067 3.40296 2.54024 3.27067 2.50655L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.89894 2.99167C3.83288 2.8722 3.74305 2.76753 3.635 2.6841L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L4.01914 3.37873C4.00591 3.24286 3.96501 3.11113 3.89894 2.99167L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.97584 3.7817C4.01763 3.65174 4.03236 3.5146 4.01914 3.37873L3.02384 3.4756ZM3.02384 3.4756L3.02384 3.4756L3.77617 4.1344C3.8661 4.03169 3.93405 3.91166 3.97584 3.7817L3.02384 3.4756ZM3.00179 3.50264C2.67449 3.93369 2.49816 4.46048 2.50001 5.00171L3.5 4.99829C3.4989 4.67663 3.6037 4.36355 3.79822 4.10736L3.00179 3.50264ZM2.5 5C2.5 5.66304 2.76339 6.29893 3.23224 6.76777L3.93934 6.06066C3.65804 5.77936 3.5 5.39782 3.5 5L2.5 5ZM3.23224 6.76777C3.70108 7.23661 4.33696 7.5 5 7.5L5 6.5C4.60218 6.5 4.22065 6.34196 3.93934 6.06066L3.23224 6.76777ZM5 7.5C5.66304 7.5 6.29893 7.23661 6.76777 6.76777L6.06066 6.06066C5.77936 6.34196 5.39783 6.5 5 6.5L5 7.5ZM6.76777 6.76777C7.23661 6.29893 7.5 5.66304 7.5 5L6.5 5C6.5 5.39782 6.34197 5.77936 6.06066 6.06066L6.76777 6.76777ZM7.5 5.00171C7.50185 4.46048 7.32552 3.93369 6.99822 3.50264L6.20179 4.10736C6.39631 4.36355 6.5011 4.67663 6.50001 4.99829L7.5 5.00171ZM7.01384 3.5244L7.01384 3.5244L6.02641 3.36635C5.98618 3.6177 6.04331 3.87492 6.18616 4.0856L7.01384 3.5244ZM7.01384 3.5244L7.01384 3.5244L6.40268 2.73289C6.2012 2.88846 6.06664 3.115 6.02641 3.36635L7.01384 3.5244ZM7.01384 3.5244L7.01384 3.5244L7.11072 2.5291C6.85737 2.50444 6.60415 2.57732 6.40268 2.73289L7.01384 3.5244ZM7.01384 3.5244L7.01384 3.5244L7.76617 2.8656C7.59847 2.6741 7.36406 2.55376 7.11072 2.5291L7.01384 3.5244ZM6.99393 3.50016C7.32445 3.92916 7.50254 4.45611 7.50001 4.99767L8.5 5.00233C8.50356 4.23837 8.25235 3.49502 7.78608 2.88984L6.99393 3.50016ZM7.5 5C7.5 5.66304 7.23661 6.29893 6.76777 6.76777L7.47488 7.47487C8.13125 6.8185 8.5 5.92826 8.5 5L7.5 5ZM6.76777 6.76777C6.29893 7.23661 5.66304 7.5 5 7.5L5 8.5C5.92826 8.5 6.8185 8.13125 7.47488 7.47487L6.76777 6.76777Z",
                          stroke: "rgba(0,0,0,1)",
                          fillRule: "nonzero",
                          strokeWidth: 0,


                        },
                        {
                          d: "M5 0C4.0111 -2.22045e-16 3.0444 0.293245 2.22215 0.842652C1.39991 1.39206 0.759043 2.17295 0.380605 3.08658C0.00216642 4.00021 -0.0968503 5.00555 0.0960759 5.97545C0.289002 6.94536 0.765206 7.83627 1.46447 8.53553C2.16373 9.2348 3.05465 9.711 4.02455 9.90393C4.99446 10.0969 5.99979 9.99784 6.91342 9.6194C7.82705 9.24096 8.60794 8.6001 9.15735 7.77785C9.70676 6.95561 10 5.98891 10 5C10 4.34339 9.87067 3.69321 9.6194 3.08658C9.36813 2.47995 8.99983 1.92876 8.53554 1.46447C8.07124 1.00017 7.52005 0.631876 6.91342 0.380602C6.30679 0.129329 5.65661 6.66134e-16 5 0ZM4.5 2.5C4.5 2.36739 4.55268 2.24021 4.64645 2.14645C4.74022 2.05268 4.86739 2 5 2C5.13261 2 5.25979 2.05268 5.35356 2.14645C5.44732 2.24021 5.5 2.36739 5.5 2.5L5.5 4.5C5.5 4.63261 5.44732 4.75979 5.35356 4.85355C5.25979 4.94732 5.13261 5 5 5C4.86739 5 4.74022 4.94732 4.64645 4.85355C4.55268 4.75979 4.5 4.63261 4.5 4.5L4.5 2.5ZM5 8C4.20435 8 3.44129 7.68393 2.87868 7.12132C2.31607 6.55871 2 5.79565 2 5C1.99695 4.34724 2.2116 3.71209 2.61 3.195C2.64831 3.13851 2.69778 3.09045 2.75536 3.0538C2.81294 3.01715 2.87742 2.99268 2.94482 2.98189C3.01222 2.9711 3.08111 2.97423 3.14725 2.99107C3.2134 3.00792 3.27539 3.03814 3.32942 3.07985C3.38345 3.12157 3.42836 3.1739 3.46139 3.23364C3.49442 3.29337 3.51487 3.35923 3.52149 3.42717C3.5281 3.4951 3.52073 3.56367 3.49984 3.62865C3.47895 3.69363 3.44497 3.75365 3.4 3.805C3.13909 4.14862 2.99853 4.56856 3 5C3 5.53043 3.21072 6.03914 3.58579 6.41421C3.96086 6.78929 4.46957 7 5 7C5.53044 7 6.03914 6.78929 6.41422 6.41421C6.78929 6.03914 7 5.53043 7 5C7.00148 4.56856 6.86091 4.14862 6.6 3.805C6.52858 3.69966 6.50001 3.57105 6.52012 3.44537C6.54024 3.3197 6.60752 3.20643 6.70826 3.12864C6.809 3.05086 6.9356 3.01442 7.06228 3.02675C7.18895 3.03908 7.30616 3.09925 7.39 3.195C7.7884 3.71209 8.00305 4.34724 8 5C8 5.79565 7.68393 6.55871 7.12132 7.12132C6.55871 7.68393 5.79565 8 5 8Z",
                          // Use the dynamic color here
                          fill: Water_valveColor,
                          fillRule: "nonzero",
                        },
                      ]}
                      display="block"
                      gap="unset"
                      alignItems="unset"
                      justifyContent="unset"
                      shrink="0"
                      style={{
                        position: "absolute",
                        top: "725px",
                        left: "317px",
                      }}

                    />
                  </div>

                )}
              </Authenticator>
            </div>
          }
        />
        <Route path="/concrete-mix" element={<ConcreteMixForm />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
      {showSecondaryImage && (
        <img
          src="https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-22_at_9.25.21_PM-removebg-preview.png"
          alt="Secondary Dynamic IoT"
          style={{
            width: "6.81px",
            height: "8.93px",
            position: "absolute",
            top: "622px",
            left: "115px",
            objectFit: "cover",
            animation: "moveDown 13s ease-in-out forwards",
          }}
        />
      )}
      {showSecondaryImage1 && (
        <img
          src="https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-22_at_9.25.21_PM-removebg-preview.png"
          alt="Secondary Dynamic IoT"
          style={{
            width: "6.81px",
            height: "8.93px",
            position: "absolute",
            top: "622px",
            left: "90px",
            objectFit: "cover",
            animation: "moveDown 13s ease-in-out forwards",
          }}
        />
      )}







    </Router>
  );
}


export default App;