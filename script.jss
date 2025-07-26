document.getElementById('riskForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Get inputs
  const name = document.getElementById('name').value || 'Patient';
  const age = parseFloat(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const race = document.getElementById('race').value;
  const tc = parseFloat(document.getElementById('tc').value);
  const hdl = parseFloat(document.getElementById('hdl').value);
  const sbp = parseFloat(document.getElementById('sbp').value);
  const bpTreatment = document.getElementById('bpTreatment').value === 'yes';
  const smoker = document.getElementById('smoker').value === 'yes';
  const diabetes = document.getElementById('diabetes').value === 'yes';
  const ldl = parseFloat(document.getElementById('ldl').value);
  const tg = parseFloat(document.getElementById('tg').value);
  const glucose = parseFloat(document.getElementById('glucose').value);
  const hba1c = parseFloat(document.getElementById('hba1c').value);
  const familyHistory = document.getElementById('familyHistory').value === 'yes';

  if (isNaN(age) || isNaN(tc) || isNaN(hdl) || isNaN(sbp)) {
    alert("Please enter valid numeric values for age, cholesterol, and blood pressure.");
    return;
  }

  // PCE Risk Calculation
  const lnAge = Math.log(age);
  const lnAgeSq = lnAge * lnAge;
  const lnTc = Math.log(tc);
  const lnHdl = Math.log(hdl);
  const lnSbp = Math.log(sbp);

  let xBeta = 0;
  let S0_10 = 0.9144;

  if (gender === 'male' && race === 'africanAmerican') {
    xBeta = -24.35715 + 0.88941 * lnAge + 0.25411 * lnAgeSq + 0.51092 * lnTc + (-0.83642) * lnHdl + 0.42191 * lnSbp + 0.47654 * (bpTreatment ? 1 : 0) + 0.50361 * (smoker ? 1 : 0) + 0.21558 * (diabetes ? 1 : 0);
    S0_10 = 0.8954;
  } else if (gender === 'male' && race !== 'africanAmerican') {
    xBeta = -29.08598 + 0.76551 * lnAge + 0.65665 * lnAgeSq + 0.79384 * lnTc + (-0.60351) * lnHdl + 0.50604 * lnSbp + 0.34275 * (bpTreatment ? 1 : 0) + 0.96187 * (smoker ? 1 : 0) + 0.66051 * (diabetes ? 1 : 0);
    S0_10 = 0.9144;
  } else if (gender === 'female' && race === 'africanAmerican') {
    xBeta = -29.09743 + 1.33514 * lnAge + 0.09673 * lnAgeSq + 0.15403 * lnTc + (-0.55625) * lnHdl + 0.39568 * lnSbp + 0.19337 * (bpTreatment ? 1 : 0) + 0.50668 * (smoker ? 1 : 0) + 0.34534 * (diabetes ? 1 : 0);
    S0_10 = 0.9597;
  } else {
    xBeta = -29.09743 + 1.33514 * lnAge + 0.13825 * lnAgeSq + 0.92974 * lnTc + (-0.77225) * lnHdl + 0.66157 * lnSbp + 0.55135 * (bpTreatment ? 1 : 0) + 0.85061 * (smoker ? 1 : 0) + 0.51548 * (diabetes ? 1 : 0);
    S0_10 = 0.9665;
  }

  const expXBeta = Math.exp(xBeta);
  const survival = Math.pow(S0_10, expXBeta);
  const risk = (1 - survival) * 100;
  const riskPercent = Math.min(Math.max(risk, 0), 100).toFixed(1);

  // Display result
  document.getElementById('riskPercent').textContent = riskPercent;
  const riskCategorySpan = document.getElementById('riskCategory');
  const medicalAdviceSpan = document.getElementById('medicalAdvice');

  let category = '';
  let advice = '';

  if (risk < 5) {
    category = "Low";
    advice = "Your risk is low. Continue healthy habits like balanced diet and regular exercise.";
  } else if (risk <= 7.5) {
    category = "Borderline";
    advice = "Your risk is borderline. Consider lifestyle changes and regular check-ups.";
  } else if (risk <= 20) {
    category = "Intermediate";
    advice = "Your risk is elevated. Consult a doctor for preventive therapy and lifestyle plan.";
  } else {
    category = "High";
    advice = "Your risk is high. Immediate medical consultation is recommended for statins, BP control, and diabetes management.";
  }

  riskCategorySpan.textContent = category;
  medicalAdviceSpan.textContent = advice;

  // Blood Test Review
  const bloodTestAdvice = document.getElementById('bloodTestAdvice');
  bloodTestAdvice.innerHTML = '';

  if (ldl && ldl > 160) bloodTestAdvice.innerHTML += `<li><strong>High LDL</strong>: Consider statins and dietary changes.</li>`;
  if (tg && tg > 150) bloodTestAdvice.innerHTML += `<li><strong>High Triglycerides</strong>: Reduce sugar, alcohol, and refined carbs.</li>`;
  if (glucose && glucose > 126) bloodTestAdvice.innerHTML += `<li><strong>High Glucose</strong>: Fasting >126 mg/dL suggests diabetes. Confirm with HbA1c.</li>`;
  if (hba1c && hba1c >= 6.5) bloodTestAdvice.innerHTML += `<li><strong>Diagnosis of Diabetes</strong>: HbA1c ≥6.5%. Start medical management.</li>`;
  if (familyHistory) bloodTestAdvice.innerHTML += `<li><strong>Family History</strong>: Increases risk. Monitor more frequently.</li>`;
  if (smoker) bloodTestAdvice.innerHTML += `<li><strong>Smoking</strong>: Major risk factor. Quitting reduces risk significantly.</li>`;

  // Action Plan
  const actionPlan = document.getElementById('actionPlan');
  actionPlan.innerHTML = `
    <li>Follow up with a cardiologist or primary care doctor.</li>
    <li>Adopt a heart-healthy diet (Mediterranean or DASH).</li>
    <li>Exercise 150 mins/week (brisk walking, cycling).</li>
    <li>Monitor BP and cholesterol every 6 months.</li>
    <li>If risk >7.5%, discuss statin therapy with your doctor.</li>
  `;

  // Show result
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('downloadPdf').style.display = 'block';
});

// PDF Export
document.getElementById('downloadPdf').addEventListener('click', function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const name = document.getElementById('name').value || 'Patient';
  const riskPercent = document.getElementById('riskPercent').textContent;
  const category = document.getElementById('riskCategory').textContent;
  const advice = document.getElementById('medicalAdvice').textContent;

  doc.setFontSize(18);
  doc.text("Cardiovascular Risk Assessment", 20, 20);

  doc.setFontSize(12);
  doc.text(`Name: ${name}`, 20, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
  doc.text(`10-Year ASCVD Risk: ${riskPercent}%`, 20, 50);
  doc.text(`Risk Category: ${category}`, 20, 60);
  doc.text(`Medical Advice: ${advice}`, 20, 70);

  doc.text("Blood Test Review:", 20, 90);
  const bloodLines = [];
  document.querySelectorAll('#bloodTestAdvice li').forEach(li => bloodLines.push(li.textContent));
  bloodLines.forEach((line, i) => doc.text(`• ${line}`, 20, 100 + i * 10));

  doc.text("Recommended Actions:", 20, 140 + bloodLines.length * 10);
  const actionLines = [
    "Follow up with a cardiologist or primary care doctor.",
    "Adopt a heart-healthy diet (Mediterranean or DASH).",
    "Exercise 150 mins/week (brisk walking, cycling).",
    "Monitor BP and cholesterol every 6 months.",
    "If risk >7.5%, discuss statin therapy with your doctor."
  ];
  actionLines.forEach((line, i) => doc.text(`• ${line}`, 20, 150 + bloodLines.length * 10 + i * 10));

  doc.save(`Cardiovascular_Risk_Report_${name}.pdf`);
});