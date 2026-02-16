document.getElementById("btn").addEventListener("click", analyse);

function analyse() 
  {
    let profile = document.getElementById("profile").value;
    
    const ukGradeRaw = document.getElementById("ukGrade").value;
    const ukClass = document.getElementById("ukClass").value;
    const tier = document.getElementById("tier").value;
    const result = document.getElementById("result");

    // this decides what input to use (percentage or classification)
    let ukPercent = null;

      if (ukGradeRaw !== "") 
        {
            const n = parseFloat(ukGradeRaw);
            if (Number.isNaN(n) || n < 0 || n > 100) 
                {
                    result.innerHTML = "Please enter a valid UK percentage (0–100).";
                    return;
                }
            ukPercent = n;
        } 
      
      else if (ukClass !== "") 
        {
            // midpoint estimates to make it usable even without %
            if (ukClass === "first") ukPercent = 75;
            if (ukClass === "twoone") ukPercent = 65;
            if (ukClass === "twotwo") ukPercent = 55;
            if (ukClass === "third") ukPercent = 45;
        } 
          
      else 
        {
            result.innerHTML = "Enter a UK percentage OR select a UK classification.";
            return;
        }

    const gpa = ukToUsGpa(ukPercent);
    const insight = competitivenessHint(gpa, tier, profile);

    const plainText =
      `Your Percentage: ${ukPercent}%\n` +
      `Estimated US GPA: ${gpa.toFixed(1)}\n` +
      `MS CS competitiveness hint: ${insight}\n\n` +
      `Note: This is an estimate.`;

    result.dataset.plain = plainText;

    result.innerHTML = `
      <h3>Results</h3>
      <p><strong> Your Percentage:</strong> ${ukPercent}%</p>
      <p><strong>Estimated US GPA:</strong> ${gpa.toFixed(1)}</p>
      <p><strong>MS CS competitiveness hint:</strong> ${insight}</p>
      <p style="color:#555; margin-top:10px;">
        This is an estimate. Schools evaluate transcripts differently and often look at course rigour, grades in CS/math modules, research, internships, SOP, and letters.
      </p>
    `;
  }
    

function ukToUsGpa(uk) 
  {
    // Approximate mapping (simple MVP).
    if (uk >= 70) return 4.0;
    if (uk >= 67) return 3.7;
    if (uk >= 63) return 3.5;
    if (uk >= 60) return 3.3;
    if (uk >= 57) return 3.0;
    if (uk >= 53) return 2.7;
    if (uk >= 50) return 2.3;
    if (uk >= 40) return 2.0;
    return 1.7;
  }

function competitivenessHint(gpa, tier, profile) 
  {
    let base;
    let label;

    if (tier === "10") { base = 3.7; label = "Top 10"; }
    else if (tier === "25") { base = 3.5; label = "Top 25"; }
    else { base = 3.3; label = "Top 50"; }

    const threshold = adjustedThreshold(base, profile);

    if (gpa >= threshold) 
      {
        return `Competitive for ${label} MS CS programs (GPA-wise).`;
      }

    if (label === "Top 10") 
      {
        return "Below typical Top 10 range. Strong research/internships + standout SOP can help.";
      }

    if (label === "Top 25") 
      {
        return "Slightly below typical Top 25 range. Profile strength matters a lot.";
      }
    return "May be below typical Top 50 range. Consider strengthening projects, research, and recommendations.";
  }

function adjustedThreshold(base, profile) 
  {
    if (profile === "strong") return base - 0.2;
    if (profile === "average") return base - 0.1;
    return base; // unknown or limited
  }

document.getElementById("copyBtn").addEventListener("click", async () => {
  const result = document.getElementById("result");
  const text = result.dataset.plain;

  if (!text) return alert("Run the analysis first.");

  try {
    await navigator.clipboard.writeText(text);
    alert("Copied!");
  } catch (e) {
    alert("Copy failed. Try manually selecting the text.");
  }
});

document.getElementById("shareBtn").addEventListener("click", async () => {
  const url = window.location.href;
  const title = document.title;

  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch (e) {}
  }

  try {
    await navigator.clipboard.writeText(url);
    alert("Link copied!");
  } catch (e) {
    prompt("Copy this link:", url);
  }
});
