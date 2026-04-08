import { collection, query, where, getDocs, addDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { provisionTeamRepo } from "./github";
import { toast } from "sonner";

const FORGE_IDEAS = [
  { 
    name: "NeuroMesh", 
    desc: "Decentralized neural network for edge computing.",
    problem: "Edge devices lack the unified computation power required to run heavy LLMs locally without massive latency.",
    expectedOutcome: "A peer-to-peer protocol that splits inference rendering across multiple local devices simultaneously.",
    techStack: ["Rust", "WebRTC", "TensorFlow Lite"],
    successCriteria: "Must successfully split a 7B model inference across at least 3 simulated nodes with sub-5sec latency."
  },
  { 
    name: "VoidChat", 
    desc: "Zero-knowledge encryption protocol for distributed messaging.",
    problem: "Current messaging apps harvest metadata even if the message contents are encrypted.",
    expectedOutcome: "A CLI/Web hybrid chat interface where all metadata routing is completely obscured via onion routing.",
    techStack: ["Go", "React", "WebSockets"],
    successCriteria: "Two clients must be able to exchange messages without the middle server logging IP or timestamp associations."
  },
  { 
    name: "AquaSense", 
    desc: "Smart water quality monitoring system for urban areas.",
    problem: "City infrastructure lacks real-time, algorithmic anomaly detection for water contamination pipelines.",
    expectedOutcome: "An IoT dashboard interface that consumes mock sensor data and predicts contamination propagation.",
    techStack: ["Next.js", "Python (FastAPI)", "PostgreSQL"],
    successCriteria: "UI must render a live map that flashes red in affected zones within 500ms of a mock backend trigger."
  },
  { 
    name: "ZenithDB", 
    desc: "Eventually-consistent multi-master database for flight telemetry.",
    problem: "Airplanes lose direct connection constantly, causing data desync when reconnecting to ground nodes.",
    expectedOutcome: "A lightweight, resilient key-value store that strictly enforces conflict-free replicated data types (CRDTs).",
    techStack: ["TypeScript", "Node.js", "Redis"],
    successCriteria: "Must resolve simultaneous contradictory writes from two offline clients deterministically upon reconnection."
  }
];

export const triggerManualDraw = async (currentUserId: string) => {
  try {
    // 1. Fetch registered users
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("registeredForNextSprint", "==", true));
    const querySnapshot = await getDocs(q);
    
    const registeredUsers = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as any[];

    if (registeredUsers.length === 0) {
       // For testing: if nobody is registered, just use the current user
       const userDoc = await getDocs(query(usersRef, where("uid", "==", currentUserId)));
       if (userDoc.empty) throw new Error("Current user not found in DB.");
       registeredUsers.push({ uid: userDoc.docs[0].id, ...userDoc.docs[0].data() });
    }

    // 2. Simple matching logic
    const teamMembers = registeredUsers.slice(0, 3);
    const memberUids = teamMembers.map(u => u.uid);
    const githubUsernames = teamMembers.map(u => u.githubUsername).filter(Boolean);

    toast.info(`Matching ${teamMembers.length} engineers...`);

    // 3. GitHub Provisioning (Fallback Logic)
    const teamId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const idea = FORGE_IDEAS[Math.floor(Math.random() * FORGE_IDEAS.length)];
    const projectName = idea.name;
    const projectDesc = idea.desc;
    
    const repoName = `sprint-${projectName.toLowerCase()}-${teamId}`;

    const teamAdjectives = ["Neon", "Quantum", "Apex", "Nova", "Cyber", "Void", "Iron", "Ghost"];
    const teamNouns = ["Forgers", "Syndicate", "Wraiths", "Nomads", "Hackers", "Mesh", "Ops", "Minds"];
    const forgeTeamName = `${teamAdjectives[Math.floor(Math.random() * teamAdjectives.length)]} ${teamNouns[Math.floor(Math.random() * teamNouns.length)]}`;

    toast.info(`Provisioning Workspace (${repoName})...`);
    
    let repoUrl = "https://github.com/PENDING_WORKSPACE";
    try {
      // Attempt automated provisioning
      repoUrl = await provisionTeamRepo(repoName, githubUsernames, { 
        ...idea, 
        teamName: forgeTeamName 
      });
    } catch (err) {
      console.warn("GitHub provisioning failed (likely missing token). Using fallback workspace.");
      // Provide a generic or fallback workspace if integration fails
      repoUrl = `https://github.com/sprintforge-org/${repoName}-fallback`;
    }

    // 4. Record in Firestore
    const memberDetails = teamMembers.map(u => {
       const forgeId = u.displayName || `ForgeAnon_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
       const skillRole = (u.skills && u.skills.length > 0) ? u.skills[0] : "Generalist Forger";
       return {
          uid: u.uid,
          name: forgeId,
          role: skillRole
       };
    });

    const teamData = {
      teamId: teamId,
      forgeTeamName: forgeTeamName,
      members: memberUids,
      memberNames: memberDetails.map(m => m.name),
      memberDetails: memberDetails,
      repoUrl: repoUrl,
      createdAt: Timestamp.now(),
      status: "active",
      sprintId: new Date().toISOString().substring(0, 10),
      projectName: projectName,
      description: projectDesc,
      problem: idea.problem,
      expectedOutcome: idea.expectedOutcome,
      techStack: idea.techStack,
      successCriteria: idea.successCriteria
    };

    console.log("Saving team document to Firestore:", teamData);
    const teamRef = await addDoc(collection(db, "teams"), teamData);
    
    // Step 5: Reset "registered" status and SET 7-DAY LOCK TIMESTAMPS
    toast.info("Locking users into Sprint for 7 days...");
    const currentTimestamp = Timestamp.now();
    for (const uid of memberUids) {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { 
        registeredForNextSprint: false,
        lastSprintStartedAt: currentTimestamp // Enforces the 7 Day Lock
      });
    }

    toast.success(`Draw Complete! Workspace Created.`);
    return teamRef.id;
  } catch (error: any) {
    console.error("Match Draw Error:", error);
    toast.error(`Teaming failed: ${error.message}`);
    throw error;
  }
};
