var url = window.location.href;
var currentLocation = url.substr(url.lastIndexOf('/') + 1);

auth.onAuthStateChanged(user => {
    console.log("auth state change")
    console.log(user)
})

// -------------- begin auth ---------------
if(currentLocation == 'signup.html'){
    // submission for signup form
    const signup = document.getElementById("submit-button");
    signup.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("clicked");

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirm").value;
        console.log(email, password)
        if(password != confirm){
            alert("Passwords do not match");
        }
        // user validations to prevent errors in authentication
        var valid = true;
        auth.createUserWithEmailAndPassword(email, password).catch(function(error) {
            var errorMessage = error.message;
            alert(errorMessage);
            valid = false;
        }).then(cred => {
            if(valid == true){
                console.log("user created")
                console.log(cred.user.email)
                userLoggedIn();
            }
        })
    });

    // submission for login form
    const login = document.getElementById("login-button");
    login.addEventListener('click', (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        console.log(email)
        // user validations to prevent errors in authentication
        var valid = true;
        auth.signInWithEmailAndPassword(email, password).catch(function(error) {
            var errorMessage = error.message;
            alert(errorMessage);
            valid = false;
        }).then(cred => {
            if(valid == true){
                console.log("user logged in")
                console.log(cred.user.email)
                



                firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
                .then(function() {
                  // Existing and future Auth states are now persisted in the current
                  // session only. Closing the window would clear any existing state even
                  // if a user forgets to sign out.
                  userLoggedIn();
                  // New sign-in will be persisted with session persistence.
                  return firebase.auth().signInWithEmailAndPassword(email, password);
                })
                .catch(function(error) {
                  // Handle Errors here.
                  console.log(error.message);
                });






                var user = firebase.auth().currentUser;
                    if (user) {
                        console.log("there is a user")
                        // console.log(user)
                    // User is signed in.
                    } else {
                        console.log("no user")
                    // No user is signed in.
                    }
            }
        })
    });

    // ---------------- end auth --------------


    // toggle signup/login form switch
    function toggleLogin(){
        if(document.getElementById("signup-form").style.display != "none"){
            console.log("toggle login")
            document.getElementById("signup-form").style.display = "none";
            document.getElementById("existing").style.display = "none";
            document.getElementById("new").style.display = "inline";
            document.getElementById("login-form").style.display = "inline";
        }
        else{
            console.log("toggle signup")
            document.getElementById("signup-form").style.display = "inline";
            document.getElementById("existing").style.display = "inline";
            document.getElementById("new").style.display = "none";
            document.getElementById("login-form").style.display = "none";
        }
    } //end toggleLogin()

    // after user logs in, access profile + upload
    function userLoggedIn(){
        window.location.href = 'alt/home.html';
    }

    document.getElementById("login-redirect").addEventListener('click', (e) => {
        toggleLogin();
    });
    document.getElementById("signup-redirect").addEventListener('click', (e) => {
        toggleLogin();
    });
} // ----------- end signup.html actions


if(window.location.pathname == './discover.html'){
    // discover page
    function filterSelected(id){
        console.log(id);
        /*
            set button as selected, change colour
            display related projects

        */
    }
}


if(currentLocation == 'profile.html'){
    // get current user
    setTimeout( function(){
        user = firebase.auth().currentUser;
    }, 1500);

    function logoutUser(){
        firebase.auth().signOut().then(function() {
            window.location.href = '../home.html';
        }).catch(function(error) {
            // An error happened.
        });
    }

    // ----------- start profile page modal ------------
    function closeModal(){
        if(document.getElementById("modal").style.display != "inline"){
            //open modal
            document.getElementById("modal").style.display = "inline"
        }
        else{
            // close modal
            document.getElementById("modal").style.display = "none"
        }
    }

    function categorySelected(id){
        categories.push(id);
        console.log(categories);
        document.getElementById(id).style.color = "#FFFFFF";
        document.getElementById(id).style.background = "#F2684A";
    }

    function toggleCheckbox(id){
        document.getElementById(id).style.background = "#F2684A";
        if(id == 'email-checkbox'){
            optional.push("email");
            document.getElementById(id).style.backgroundImage = "url('email.svg')";
        }
        else if (id == 'github-checkbox'){
            optional.push("github");
            document.getElementById(id).style.backgroundImage = "url('github.svg')";
        }
    }


    // upload new project
    document.getElementById('upload').addEventListener('click', (e) => {
        console.log("upload project");

        var title = document.getElementById('project-title').value;
        var url = document.getElementById("url").value;
        var description = document.getElementById('description').value;

        if(title == null){
            alert("Please enter a project title");
        }
        
        // Add a new document in collection "cities"
        db.collection(user.email).doc(title).set({
            url: url,
            description: description,
            categories: categories,
            optional: optional
        }).then(function() {
            console.log("Document successfully written!");
            closeModal();
        }).catch(function(error) {
            console.error("Error writing document: ", error);
        });
    }) // end upload new project
    // ----------- end profile page modal ------------

    function refreshProjects(){
        document.getElementById("default-empty").style.display = 'none';

        var ifrm = document.createElement('iframe');
        ifrm.setAttribute('id', 'ifrm'); // assign an id
        ifrm.setAttribute('class', 'ifrm');
        ifrm.setAttribute('src', 'https://en.wikipedia.org/wiki/Wiki');

        

        var table = document.getElementById("myTable");

        db.collection(user.email).get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
                var row = table.insertRow(-1);
                var cell = row.insertCell(0);
                cell.innerHTML = doc.id;
                cell.className = 'posted-title';

                var row = table.insertRow(-1);
                var cell = row.insertCell(0);
                cell.innerHTML = doc.data().description;
                cell.className = 'posted-title';

                document.getElementById("myTable").appendChild(ifrm);
            });
        });
        
        

        // for (j = 0; j < optional.length; j++){
        //     if(optional[j] == 'email'){
        //         // add email
        //     }
        //     else if(optional[j] == 'github'){
        //         // add github
        //     }
        //     console.log(x);
        //     var table = document.getElementById("myTable");
        //     var row = table.insertRow(0);
        //     var cell1 = row.insertCell(0);
        //     var cell2 = row.insertCell(1);
        //     cell1.innerHTML = local_high_carbon_array[x][0];
        //     cell2.innerHTML = local_high_carbon_array[x][1];
        //     cell1.className = 'red';
        //     cell2.className = 'red';
        //   }


    }

} // ------- end profile.html actions

