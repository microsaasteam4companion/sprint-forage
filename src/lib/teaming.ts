import { collection, query, where, getDocs, addDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { provisionTeamRepo } from "./github";
import { toast } from "sonner";

const FORGE_IDEAS = [
  { name: "NeuroMesh", desc: "Decentralized neural network for edge computing." },
  { name: "SolarChain", desc: "Peer-to-peer energy trading platform using IoT." },
  { name: "VoidChat", desc: "Zero-knowledge encryption protocol for distributed messaging." },
  { name: "GigaForge", desc: "High-performance distributive compiler for Rust." },
  { name: "AquaSense", desc: "Smart water quality monitoring system for urban areas." },
  { name: "LuminaOS", desc: "Minimalist operating system for lightweight robotics." },
  { name: "PulseKit", desc: "Real-time health monitoring via low-latency WebSockets." },
  { name: "ZenithDB", desc: "Eventually-consistent multi-master database for flight telemetry." }
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

    // 3. GitHub Provisioning (Teaming 2.0)
    const teamId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const idea = FORGE_IDEAS[Math.floor(Math.random() * FORGE_IDEAS.length)];
    const projectName = idea.name;
    const projectDesc = idea.desc;
    
    // Format repo name: sprint-[ProjectName]-[TeamID] (sanitized)
    const repoName = `sprint-${projectName.toLowerCase()}-${teamId}`;

    toast.info(`Step 2/5: Provisioning GitHub Repo (${repoName})...`);
    const repoUrl = await provisionTeamRepo(repoName, githubUsernames);

    // 4. Record in Firestore
    const teamData = {
      teamId: teamId,
      members: memberUids,
      memberNames: teamMembers.map(u => u.displayName || u.githubUsername || "Anonymous"),
      repoUrl: repoUrl ?? "PROVISIONING_FAILED",
      createdAt: Timestamp.now(),
      status: "active",
      sprintId: new Date().toISOString().substring(0, 10),
      projectName: projectName,
      description: projectDesc,
    };

    console.log("Saving team document to Firestore:", teamData);
    toast.info("Step 4/5: Registering Team in Forge Registry...");
    
    const teamRef = await addDoc(collection(db, "teams"), teamData);
    
    console.log("Team Document Saved with ID:", teamRef.id);
    toast.success("Team Registry Created!");

    // Step 5: Reset "registered" status
    toast.info("Step 5/5: Updating teammate status...");
    for (const uid of memberUids) {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { registeredForNextSprint: false });
    }

    toast.success(`Draw Complete! Repository: ${repoUrl}`);
    return teamRef.id;
  } catch (error: any) {
    console.error("Match Draw Error:", error);
    toast.error(`Teaming failed: ${error.message}`);
    throw error;
  }
};
