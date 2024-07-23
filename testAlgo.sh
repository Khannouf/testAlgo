#!/bin/bash

# Fonction pour exécuter un test et comparer les fichiers de sortie
run_test() {
    local input_file=$1
    local expected_output_file=$2
    local description=$3
    local actual_output_file="output.csv"

    # Afficher la description du test
    echo "Exécution du test : $description"

    # Exécuter l'algorithme en utilisant le fichier d'entrée
    node readCsv2.js "$input_file"

    # Comparer la sortie réelle avec la sortie attendue
    if diff -bB "$actual_output_file" "$expected_output_file" > /dev/null; then
        echo "OK"
        #"Test réussi : $description"
    else
        echo "KO" 
        #"Test échoué : $description"
        # Afficher les différences
        diff "$actual_output_file" "$expected_output_file"
    fi
}

# Comparer tous les fichiers de tests avec descriptions
run_test "./test/input/test1Input.csv" "./test/output/test1Output.csv" "Validation exo niv 2"
run_test "./test/input/test2Input.csv" "./test/output/test2Output.csv" "Validation exo niv 2 sur plusieurs exercices"
run_test "./test/input/test3Input.csv" "./test/output/test3Output.csv" "Validation exo niv 1 minimale"
run_test "./test/input/test4Input.csv" "./test/output/test4Output.csv" "Validation exo niv 1 sur plusieurs exercices"
run_test "./test/input/test5Input.csv" "./test/output/test5Output.csv" "Echec exo niv 2"
run_test "./test/input/test6Input.csv" "./test/output/test6Output.csv" "Echec exo niv 2 sur plusieurs exercices"
run_test "./test/input/test7Input.csv" "./test/output/test7Output.csv" "Echec exo niv 1 minimale"
run_test "./test/input/test8Input.csv" "./test/output/test8Output.csv" "Echec exo niv 1 sur plusieurs exercices"
run_test "./test/input/test9Input.csv" "./test/output/test9Output.csv" "Rajout d'une vie lors de 5 serie"
run_test "./test/input/test10Input.csv" "./test/output/test10Output.csv" "Perte de vie lors d'un manque de jour"
run_test "./test/input/test11Input.csv" "./test/output/test11Output.csv" "Bon fonctionnement pour chaque utilisateur"
run_test "./test/input/test12Input.csv" "./test/output/test12Output.csv" "Réinitialisation de série et de vie"
