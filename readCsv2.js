const fs = require("fs");
const csv = require("csv-parser");
const { log } = require("console");

const results = [];
const results2 = [];
const sessions = {};
let countIndex = 1
let i = 1;

function isSameDate(timestamp1, timestamp2) {
  // Crée des objets Date à partir des timestamps
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);

  // Compare l'année, le mois et le jour
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

function daysBetweenDates(timestamp1, timestamp2) {
  // Convertir les timestamps en millisecondes
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);
  
  // Calculer la différence en millisecondes
  const differenceInMilliseconds = Math.abs(date2 - date1);
  
  // Convertir la différence en jours
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const differenceInDays = Math.floor(differenceInMilliseconds / millisecondsPerDay);
  
  return differenceInDays;
}

const fields = ['Date', 'Niveau', 'Allonge', 'Assis', 'SessionID', 'formattedDate', 'serie', 'vie'];

function convertToCSV(arr, fields) {
  const header = fields.join(','); // Crée l'en-tête du CSV
  const rows = arr.map(item => {
    return fields.map(field => item[field]).join(',');
  });
  return [header].concat(rows).join('\n');
}

// Enregistrer la chaîne CSV dans un fichier
function saveCSVFile(filename, data) {
  fs.writeFileSync(filename, data);
}


// Vérifier que les arguments sont passés
if (process.argv.length < 3) {
  console.error('Usage: node readCsv2.js <input.csv>');
  process.exit(1);
}

// Récupérer le fichier d'entrée depuis les arguments
const inputFilePath = process.argv[2];


fs.createReadStream( inputFilePath)
  .pipe(csv())
  .on("data", (data) => {
    dataIndex = {
      ...data,
      index: countIndex
    }
    results.push(dataIndex)
    countIndex++
    //console.log(dataIndex)
  })
  .on("end", () => {
    results.sort((a, b) => {
      const sessionIDComparison = a.SessionID.localeCompare(b.SessionID);
      if (sessionIDComparison !== 0) return sessionIDComparison;
    });
    results.forEach((result) => {
      const { SessionID } = result;
      if (!sessions[SessionID]) {
        sessions[SessionID] = { SessionID, data: [] };
      }
      sessions[SessionID].data.push(result);
    });

    // Trier les objets dans chaque SessionID par Date
    Object.keys(sessions).forEach((sessionID) => {
      sessions[sessionID].data.sort(
        (a, b) => parseInt(a.Date) - parseInt(b.Date)
      );
    });
    Object.keys(sessions).forEach((sessionID) => {
      let lastDate;
      let countActivitie = 0;
      let serie = 0;
      let vie = 2;
      let allonge = 0;
      let assis = 0;
      let countSerie = false
      let sameDate;
      let ajout;
      sessions[sessionID].data.forEach((result, index) => {
        //Vérifie qu'il y a bien un élément suivant
        if (
          sessions[sessionID].data[index + 1] &&
          sessions[sessionID].data[index + 1].Date
        ) {
          //récupère la date de l'élément suivant
          const nextDate = sessions[sessionID].data[index + 1].Date;
          //vérifie si c'est l'élément suivant est le même jour que l'élément actuel
          sameDateWithNext = isSameDate(result.Date, nextDate);
        } else {
          sameDateWithNext = false;
        }
        //si niveau 2 et true valide l'activité, sinon valide partiellement
        if (result.Niveau == 2) {
          result.Allonge == "True" ? (allonge = 2) : (allonge = allonge);
          result.Assis == "True" ? (assis = 2) : (assis = assis);
        } else {
          //exercice de niveau 1, est validé si il y en a 2
          result.Allonge == "True" ? allonge++ : (allonge = allonge);
          result.Assis == "True" ? assis++ : (assis = assis);
        }
        if ( allonge >= 2 && assis >= 2){
          // si l'élement suivant est le même jour
          if ( sameDateWithNext ){
            if (countSerie == false){
              serie = serie + 1
              countSerie = true
            }
          } else {
            if ( countSerie == false ){
              serie = serie + 1;
              ajout = ajout + 1
              
              countSerie = false;
              if (serie % 5 == 0) {
                vie = vie + 1;
              }
            }

            if ( lastDate ){
              const sameDateWithLast = isSameDate(lastDate, result.Date)
              if ( !sameDateWithLast){
                if(ajout  == 0){
                  serie = serie + 1;
                  if (serie % 5 == 0 && serie != 0) {
                    vie = vie + 1;
                  }
                } else {
                  ajout = 0;
                }
              }
            }
          }
          if (sameDateWithNext != true){
            allonge = 0;
            assis = 0;
          }
        } else {
          if ( sameDateWithNext != true ){
            allonge = 0;
            assis = 0;
            //serie = 0;
            countSerie = false
            vie = vie - 1; 
            
          }
        }
        if ( lastDate ) {
          //vérifie la différence de jour entre l'élément actuel est l'élément passé
          daysBetween = daysBetweenDates(lastDate, result.Date);
          if( serie != 0 ){
            if (daysBetween == 2) {
              vie = vie - 1;
            } else if ( daysBetween > 2) {
              serie = 0;
              vie = 2
            }
          }
        }

        
        if ( vie <= -1 ){
          serie = 0
          vie = 2
        }
        lastDate = result.Date
        result.serie = serie
        result.vie = vie
        results2.push(result)
      });
    });

    results2.sort((a,b) => a.index - b.index);
    //console.log(results2);

    // Convertir le tableau en CSV
    const csvData = convertToCSV(results2, fields);

    

    // Enregistrer les données CSV dans un fichier
    saveCSVFile('output.csv', csvData);

    //console.log('CSV file has been saved.');

    //console.log(JSON.stringify(sessions, null, 2));
  });
