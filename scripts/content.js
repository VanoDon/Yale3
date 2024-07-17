// Utility functions

/**
 * Cleans the text by removing multiple spaces, line breaks, and unnecessary strings like '...', 'See more', 'See less'.
 * @param {string} text - The text to be cleaned.
 * @returns {string|null} - The cleaned text or null if the input is falsy.
 */
function getCleanText(text) {
    const regexRemoveMultipleSpaces = / +/g;
    const regexRemoveLineBreaks = /(\r\n\t|\n|\r\t)/gm;
  
    if (!text) return null;
  
    return text.toString()
      .replace(regexRemoveLineBreaks, '')
      .replace(regexRemoveMultipleSpaces, ' ')
      .replace('...', '')
      .replace('See more', '')
      .replace('See less', '')
      .trim();
}

/**
 * Initiates the save to PDF process by finding and clicking the 'Save to PDF' button.
 * If no such button is found, it alerts the user.
 */
function savePDF() {
  const spanList = document.getElementsByTagName("span");
  for (let span of spanList) {
    if (span.textContent === 'Save to PDF') {
      span.click();
      return;
    }
  }
  alert("No option to download profile.");
}

/**
 * Expands all sections of the profile by clicking on 'See more' buttons.
 * This ensures that all data is visible for extraction.
 */
function expandButtons() {
  const selectors = [
    '.pv-profile-section.pv-about-section .lt-line-clamp__more',
    '#experience-section .pv-profile-section__see-more-inline.link',
    '.pv-profile-section.education-section button.pv-profile-section__see-more-inline',
    '.pv-skill-categories-section [data-control-name="skill_details"]',
    '.pv-entity__description .lt-line-clamp__line.lt-line-clamp__line--last .lt-line-clamp__more[href="#"]',
    '.lt-line-clamp__more[href="#"]:not(.lt-line-clamp__ellipsis--dummy)'
  ];

  selectors.forEach(selector => {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(button => button.click());
  });
}

// Main function

/**
 * Main function that initializes the extension and sets up event listeners.
 */
function main() {
  const sliderInnerHTMLString = `
    <!-- HEADER IS HERE -->
    <div id='sheader'>
      <div id='sheaderheader'></div>
      <div id='deepscancontainer'>
        <label id='deepscanlabel' for='deepscan'>Deepscan?<input type='checkbox' name='deepscan' id='deepscan' value='deepscan'/></label>
      </div>
      <div class='internal_button sticky_buttons' id='clear_text_button'>Clear Text?</div>
      <br/>
    </div>
    <br/>

    <!-- THE BODY CONTAINER IS HERE -->
    <div id='sbodycontainer'>
      <br/>
      <br/>
      <span style='font-size: 10px'><i>This textbox extracts if you scroll the slider menu.</i></span>
      <textarea id='basicprofile'></textarea>
      <br/>
      <h2> Education Section </h2>
      <br/>
      <textarea id='educationtext'></textarea>
      <br/>
      <div class='internal_button' id='education_extract_button'>Extract Education</div>
      <hr/>

      <h2> Experience Section </h2>
      <br/>
      <textarea id='experiencetext'></textarea>
      <br/>
      <div class='internal_button' id='experience_extract_button'>Extract Work Ex</div>
      <hr/>
      <h2> Licenses and Certifications </h2>
      <br/>
      <textarea id='certificationstext'></textarea>
      <br/>
      <div class='internal_button' id='certification_extract_button'>Extract Certifications</div>

      <hr/>
      <h2> Skills </h2>
      <br/>
      <textarea id='skillstext'></textarea>
      <br/>
      <div class='internal_button' id='skills_extract_button'>Extract Skills</div>
      <div id='savepdf'>Save PDF</div>
    </div>

    <!-- THE FOOTER IS HERE -->
    <div id='sfooter'><hr/>
      <div class='internal_button' id='save_profile_data_button'>Save Profile Data</div>
    </div>
  `;

  sliderGen(sliderInnerHTMLString);

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.todo === "toggle") {
      slider();
    }
  });

  document.getElementById('savepdf').addEventListener("click", savePDF);
  document.getElementById('clear_text_button').addEventListener("click", clearText);
  document.getElementById('certification_extract_button').addEventListener("click", extractCert);
  document.getElementById('skills_extract_button').addEventListener("click", extractSkills);
  document.getElementById('experience_extract_button').addEventListener("click", extractExperience);
  document.getElementById('education_extract_button').addEventListener("click", extractEducation);
  document.getElementById('save_profile_data_button').addEventListener("click", saveProfileData);

  document.getElementById("slider").onscroll = () => {
    printName();
    document.getElementById('basicprofile').value = JSON.stringify(extract());
  };
}

/**
 * Clears the text in all specified text areas.
 */
function clearText() {
  const ids = ['basicprofile', 'educationtext', 'experiencetext', 'skillstext', 'certificationstext'];
  ids.forEach(id => document.getElementById(id).value = "");
}

/**
 * Saves the profile data to a file. Prompts the user for a filename and creates a downloadable file.
 */
function saveProfileData() {
  const textBoxIds = ['basicprofile', 'educationtext', 'experiencetext', 'skillstext', 'certificationstext'];
  const profileData = {};
  textBoxIds.forEach(id => {
    const key = id.includes("text") ? id.replace("text", "") : id;
    profileData[key] = document.getElementById(id).value ? JSON.parse(document.getElementById(id).value) : "No data";
  });

  const filename = prompt("Enter file Name:");
  const data = new Blob([JSON.stringify(profileData)], {type: "application/json"});
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename + ".txt";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

/**
 * Prints the user's name on the slider header.
 */
function printName() {
  const uname = document.querySelector('div.pv-text-details__left-panel > div > h1') || document.getElementsByClassName('artdeco-entity-lockup__title ember-view')[0];
  const cleanName = getCleanText(uname?.textContent || "");
  document.getElementById('slider').querySelector('#sheaderheader').innerHTML = `<h1>${cleanName}</h1>`;
}

/**
 * Generates the slider DOM element and appends it to the body.
 * @param {string} sliderInnerHTMLString - The HTML string for the slider.
 */
function sliderGen(sliderInnerHTMLString) {
  const slider = document.createElement("div");
  slider.id = "slider";
  slider.innerHTML = sliderInnerHTMLString;
  document.body.prepend(slider);
}

/**
 * Toggles the visibility of the slider by changing its width.
 */
function slider() {
  const slider = document.getElementById("slider");
  const styler = slider.style;
  styler.width = styler.width === "0px" ? "400px" : "0px";
}

/**
 * Extracts the profile data from the page.
 * @returns {Object} - The extracted profile data.
 */
function extract() {
  const profileSection = document.querySelector(".pv-top-card");
  const fullName = profileSection?.querySelector('h1')?.textContent || null;
  const title = profileSection?.querySelector('.text-body-medium')?.textContent || null;
  const locationElement = profileSection?.querySelectorAll(".text-body-small")[1];
  const loc = locationElement?.textContent || null;
  const photoElement = document.querySelector(".pv-top-card-profile-picture__image") || profileSection?.querySelector('.profile-photo-edit__preview');
  const photo = photoElement?.getAttribute('src') || null;
  const descriptionElement = document.querySelector('div#about')?.parentElement.querySelector('.pv-shared-text-with-see-more > div > span.visually-hidden');
  const description = descriptionElement?.textContent || null;
  const url = window.location.href;

  return {
    fullName: getCleanText(fullName),
    title: getCleanText(title),
    location: getCleanText(loc),
    description: getCleanText(description),
    photo,
    url
  };
}

/**
 * Extracts certification data from the page.
 */
function extractCert() {
  const anchors = [
    { id: 'licenses_and_certifications', checked: !document.getElementById('deepscan').checked },
    { id: null, checked: document.getElementById('deepscan').checked && location.href.includes('certifications') }
  ];

  const certs = extractData(anchors, extractCertDetails);
  document.getElementById('certificationstext').value = JSON.stringify({ name: 'licenses', data: certs });
}

/**
 * Extracts skill data from the page.
 */
function extractSkills() {
  const anchors = [
    { id: 'skills', checked: !document.getElementById('deepscan').checked },
    { id: null, checked: document.getElementById('deepscan').checked && location.href.includes('skills') }
  ];

  const skills = extractData(anchors, extractSkillDetails);
  document.getElementById('skillstext').value = JSON.stringify({ name: 'skills', data: skills });
}

/**
 * Extracts experience data from the page.
 */
function extractExperience() {
  const anchors = [
    { id: 'experience', checked: !document.getElementById('deepscan').checked },
    { id: null, checked: document.getElementById('deepscan').checked && location.href.includes('experience') }
  ];

  const exp = extractData(anchors, extractExperienceDetails);
  document.getElementById('experiencetext').value = JSON.stringify(exp);
}

/**
 * Extracts education data from the page.
 */
function extractEducation() {
  const anchors = [
    { id: 'education', checked: true },
    { id: null, checked: document.getElementById('deepscan').checked && location.href.includes('education') }
  ];

  const education = extractData(anchors, extractEducationDetails);
  document.getElementById('educationtext').value = JSON.stringify({ name: 'education', data: education });
}

/**
 * Extracts data from the specified anchors using the provided detail extractor function.
 * @param {Array} anchors - An array of anchor objects containing id and checked status.
 * @param {Function} detailExtractor - The function to extract details from each item.
 * @returns {Array} - The extracted data.
 */
function extractData(anchors, detailExtractor) {
  for (const anchor of anchors) {
    if (anchor.id) {
      const list = document.getElementById(anchor.id).nextElementSibling.nextElementSibling.querySelector('ul').children;
      if (list && anchor.checked) {
        return Array.from(list).map(detailExtractor);
      }
    } else {
      const list = document.querySelector('.pvs-list').children;
      if (list && anchor.checked) {
        return Array.from(list).map(detailExtractor);
      }
    }
  }
  return [];
}

/**
 * Extracts details for each certification item.
 * @param {HTMLElement} item - The certification item element.
 * @returns {Object} - The extracted certification details.
 */
function extractCertDetails(item) {
  const elem = item.firstElementChild.firstElementChild.nextElementSibling.querySelectorAll('div');
  const firstdiv = elem[0].querySelector('a') ? elem[0].querySelector('a').children : elem[1].children;
  const url = elem[4]?.querySelector('a')?.href || "";
  const name = getCleanText(firstdiv[0].querySelector('span > span')?.textContent || "");
  const issuedby = getCleanText(firstdiv[1].querySelector('span > span')?.textContent || "");
  const issuedon = getCleanText(firstdiv[2]?.querySelector('span > span')?.textContent || "");
  const expiration = issuedon ? issuedon.split('·')[1] : "";
  const issuedon = issuedon ? issuedon.split('·')[0]?.split('Issued ')[1] || "" : "";

  return {
    id: i,
    title: name,
    issuer: issuedby,
    date: issuedon,
    expiration: expiration,
    link: url
  };
}

/**
 * Extracts details for each skill item.
 * @param {HTMLElement} item - The skill item element.
 * @returns {Object} - The extracted skill details.
 */
function extractSkillDetails(item) {
  const elem = item.firstElementChild.firstElementChild.nextElementSibling.querySelectorAll('div');
  const skill = getCleanText(elem[0]?.querySelector('div > span > span').textContent || "");
  return { id: i, title: skill };
}

/**
 * Extracts details for each experience item.
 * @param {HTMLElement} item - The experience item element.
 * @returns {Object} - The extracted experience details.
 */
function extractExperienceDetails(item) {
  const elem = item.querySelector('div > div').nextElementSibling;
  const company = elem.querySelector('div > a > div > span > span')?.textContent || "";
  const roles = [];

  if (elem.querySelector('div > a')) {
    const elems = elem.firstElementChild.nextElementSibling.querySelector('ul').children;
    for (const role of elems) {
      const keke = role.querySelector("div > div")?.nextElementSibling || null;
      const kchilds = keke?.querySelector('div > a').children;
      const rname = getCleanText(kchilds[0]?.querySelector('span > span').textContent || "");
      const startDate = getCleanText(kchilds[1].querySelector('span').textContent.split(/[-·]/)[0]);
      const endDate = getCleanText(kchilds[1].querySelector('span').textContent.split(/[-·]/)[1]);
      const loc = getCleanText(kchilds[2].querySelector('span')?.textContent || "");

      roles.push({
        id: j,
        title: rname,
        startDate: startDate,
        endDate: endDate,
        location: loc
      });
    }
  } else {
    const echilds = elem.querySelector('div > div > div > div').children;
    const rname = getCleanText(echilds[0]?.querySelector('span > span').textContent || "");
    const startDate = getCleanText(echilds[2].querySelector('span').textContent.split(/[-·]/)[0]);
    const endDate = getCleanText(echilds[2].querySelector('span').textContent.split(/[-·]/)[1]);
    const loc = getCleanText(echilds[3].querySelector('span')?.textContent || "");
    const company = getCleanText(echilds[1].querySelector('span')?.textContent.split(/[-·]/)[0]);

    roles.push({
      id: 0,
      title: rname,
      startDate: startDate,
      endDate: endDate,
      location: loc
    });
  }

  return {
    company: getCleanText(company),
    roles: roles
  };
}

/**
 * Extracts details for each education item.
 * @param {HTMLElement} item - The education item element.
 * @returns {Object} - The extracted education details.
 */
function extractEducationDetails(item) {
  const elem = item.firstElementChild.firstElementChild.nextElementSibling.querySelectorAll('div');
  const firstdiv = elem[0].querySelector('a') ? elem[0].querySelector('a').children : elem[1].children;
  const institute_name = getCleanText(firstdiv[0].querySelector('span > span')?.textContent || "");
  const degree = getCleanText(firstdiv[1].querySelector('span > span')?.textContent || "");
  const start = getCleanText(firstdiv[2]?.querySelector('span > span')?.textContent.split('-')[0] || "");
  const end = getCleanText(firstdiv[2]?.querySelector('span > span')?.textContent.split('-')[1] || "");
  const grade = getCleanText(elem?.firstElementChild?.nextElementSibling?.querySelector('ul > li >div > div > div >div >div')?.textContent.split(':')[2] || "");

  return {
    id: i,
    name: institute_name,
    degree: degree,
    start_date: start,
    end_data: end,
    grade: grade
  };
}

// Initialize the extension
const todoresp = { todo: "showPageAction" };
chrome.runtime.sendMessage(todoresp);
main();
