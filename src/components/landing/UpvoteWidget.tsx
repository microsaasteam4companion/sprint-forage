import { useEffect, useState } from 'react';

export default function UpvoteWidget({ userId, email }: { userId?: string, email?: string }) {
  const [remountKey, setRemountKey] = useState(0);

  useEffect(() => {
    // Force hard remount for cleanup when identity changes
    setRemountKey(k => k + 1);
    
    // Proactive cleanup of existing floating elements
    // @ts-ignore
    if (window.__upvote_cleanup) window.__upvote_cleanup();

    const script = document.createElement("script");
    script.src = "https://upvote.entrext.com/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [userId, email]);

  return (
    <div key={remountKey}>
      <div className="upvote-widget"
           data-application-id="69d56992c6bf2acb4955e625"
           data-user-id={userId || ''}
           data-email={email || ''}
           data-position="right"
           data-theme="light"
           data-logo-url="/logo.png"         
           data-faqs='[{"question":"What is SprintForge?","answer":"SprintForge is a platform for forced collaboration and real-world engineering projects."}]'>  
      </div>
    </div>
  );
}
