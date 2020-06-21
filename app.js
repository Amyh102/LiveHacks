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
        const github = document.getElementById("github").value;
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
                cred.user.updateProfile({
                    displayName: github
                    }).then(function() {
                        userLoggedIn();
                    }).catch(function(error) {
                        console.log(error);
                    });
                
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
                userLoggedIn();
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


if(currentLocation == 'profile.html'){
    // get current user
    setTimeout( function(){
        user = firebase.auth().currentUser;
        var creation = user.metadata.creationTime.split(" ");
        document.getElementById('joined').innerHTML = "Joined " + creation[2] + " " + creation[1] + ", " + creation[3];
        document.getElementById('info-email').innerHTML = user.email;
        document.getElementById('info-github').innerHTML = user.displayName;
        console.log("should set email")
    }, 800);

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
            document.getElementById("modal").style.display = "inline";
        }
        else{
            // close modal

            // reset categories
            for(j = 0; j < categories.length; j++){
                document.getElementById(categories[j]).style.color = "#F2684A";
                document.getElementById(categories[j]).style.background = "#FFFFFF";
            }
            // reset optional
            for(j = 0; j < optional.length; j++){
                document.getElementById(optional + "-checkbox").style.background = "#FFFFFF";
            }
            categories = [];
            optional = [];

            setTimeout(() => {
                document.getElementById("modal").style.display = "none";
                document.getElementById("modal-form").reset();
            }, 800);
            
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
            refreshProjects(user.email);
            closeModal();
        }).catch(function(error) {
            console.error("Error writing document: ", error);
        });
    }) // end upload new project
    // ----------- end profile page modal ------------
    
} // ------- end profile.html actions


var previousFilter = null;
if(currentLocation == 'discover.html'){
    setTimeout(() => {
        user = firebase.auth().currentUser;
        refreshProjects("demo-samples");
        refreshProjects(user.email);
    }, 800);
    
    // discover page
    function filterSelected(id){
        console.log(id);
        if(id == 'random'){
            randomProject();
        }
        else{
            filterProjects(id)
            setTimeout(() => {
                previousFilter = id;
            }, 300);
        }
        
    }
}


function refreshProjects(collectionID){
    document.getElementById("default-empty").style.display = 'none';
    user = firebase.auth().currentUser;

    db.collection(collectionID).get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc);
          
            table = document.getElementById("project-table");
            // add website
            var frameHolder = document.createElement('div');
            frameHolder.setAttribute('class', 'frame-holder');
            var ifrm = document.createElement('iframe');
            ifrm.setAttribute('id', 'ifrm'); // assign an id
            ifrm.setAttribute('class', 'website');
            ifrm.setAttribute('src', doc.data().url);
            var cell = document.getElementById("row").insertCell(0);
            frameHolder.appendChild(ifrm);
            cell.appendChild(frameHolder); // adds iframe into cell

            // add optional email/github
            optional =  doc.data().optional;
            if(optional.length == 1){
                var optionalElements = document.createElement('p');
                optionalElements.className = 'posted-description';
                if(optional[0] == 'email'){
                    optionalElements.innerHTML = user.email;
                    cell.appendChild(optionalElements);
                }
                else if(optional[0] == 'github'){
                    optionalElements.innerHTML = user.displayName;
                    cell.appendChild(optionalElements);
                }
            }
            else if(optional.length == 2){
                var optionalElements = document.createElement('p');
                optionalElements.className = 'posted-description';
 
                optionalElements.innerHTML = user.email + "&emsp;&emsp;" + user.displayName;
                cell.appendChild(optionalElements);
            }
            else { // anonymous poster
                var optionalElements = document.createElement('p');
                optionalElements.className = 'posted-description';
 
                optionalElements.innerHTML = optionalElements.innerHTML = "anonymous";;
                cell.appendChild(optionalElements);
            }

            var tableTitle = document.createElement('a');
            tableTitle.setAttribute('href', doc.data().url);
            tableTitle.setAttribute('target', "_blank");
            tableTitle.innerHTML = doc.id;
            tableTitle.className = 'posted-title';
            cell.appendChild(tableTitle); // adds project title
            var tableDesc = document.createElement('p');
            tableDesc.innerHTML = doc.data().description;
            tableDesc.className = 'posted-description';
            cell.appendChild(tableDesc); // adds project description 
        });
    }); // end adding to db
}// end refreshProjects()


function filterProjects(filter){
    if(filter != document.getElementById("searchbar").value){
        if(previousFilter != null){ // clear previous filter button
            document.getElementById(previousFilter).style.color = '#F2684A';
            document.getElementById(previousFilter).style.background = '#FFFFFF';
        }
        document.getElementById(filter).style.background = '#F2684A';
        document.getElementById(filter).style.color = '#FFFFFF';
    }
    user = firebase.auth().currentUser;
    document.getElementById("row").innerHTML = "";

    db.collection("demo-samples").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc);
            if(doc.data().categories.includes(filter)){
                table = document.getElementById("project-table");
                // add website
                var frameHolder = document.createElement('div');
                frameHolder.setAttribute('class', 'frame-holder');
                var ifrm = document.createElement('iframe');
                ifrm.setAttribute('id', 'ifrm'); // assign an id
                ifrm.setAttribute('class', 'website');
                ifrm.setAttribute('src', doc.data().url);
                var cell = document.getElementById("row").insertCell(0);
                frameHolder.appendChild(ifrm);
                cell.appendChild(frameHolder); // adds iframe into cell

                // add optional email/github
                optional =  doc.data().optional;
                if(optional.length == 1){
                    var optionalElements = document.createElement('p');
                    optionalElements.className = 'posted-description';
                    if(optional[0] == 'email'){
                        optionalElements.innerHTML = user.email;
                        cell.appendChild(optionalElements);
                    }
                    else if(optional[0] == 'github'){
                        optionalElements.innerHTML = user.displayName;
                        cell.appendChild(optionalElements);
                    }
                }
                else if(optional.length == 2){
                    var optionalElements = document.createElement('p');
                    optionalElements.className = 'posted-description';
    
                    optionalElements.innerHTML = user.email + "&emsp;&emsp;" + user.displayName;
                    cell.appendChild(optionalElements);
                }
                else { // anonymous poster
                    var optionalElements = document.createElement('p');
                    optionalElements.className = 'posted-description';
    
                    optionalElements.innerHTML = optionalElements.innerHTML = "anonymous";;
                    cell.appendChild(optionalElements);
                }

                var tableTitle = document.createElement('a');
                tableTitle.setAttribute('href', doc.data().url);
                tableTitle.setAttribute('target', "_blank");
                tableTitle.innerHTML = doc.id;
                tableTitle.className = 'posted-title';
                cell.appendChild(tableTitle); // adds project title
                var tableDesc = document.createElement('p');
                tableDesc.innerHTML = doc.data().description;
                tableDesc.className = 'posted-description';
                cell.appendChild(tableDesc); // adds project description 
            }
        });
    }); // end adding to db - demo samples

    db.collection(user.email).get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc);
            if(doc.data().categories.includes(filter)){
                table = document.getElementById("project-table");
                // add website
                var frameHolder = document.createElement('div');
                frameHolder.setAttribute('class', 'frame-holder');
                var ifrm = document.createElement('iframe');
                ifrm.setAttribute('id', 'ifrm'); // assign an id
                ifrm.setAttribute('class', 'website');
                ifrm.setAttribute('src', doc.data().url);
                var cell = document.getElementById("row").insertCell(0);
                frameHolder.appendChild(ifrm);
                cell.appendChild(frameHolder); // adds iframe into cell

                // add optional email/github
                optional =  doc.data().optional;
                if(optional.length == 1){
                    var optionalElements = document.createElement('p');
                    optionalElements.className = 'posted-description';
                    if(optional[0] == 'email'){
                        optionalElements.innerHTML = user.email;
                        cell.appendChild(optionalElements);
                    }
                    else if(optional[0] == 'github'){
                        optionalElements.innerHTML = user.displayName;
                        cell.appendChild(optionalElements);
                    }
                }
                else if(optional.length == 2){
                    var optionalElements = document.createElement('p');
                    optionalElements.className = 'posted-description';
    
                    optionalElements.innerHTML = user.email + "&emsp;&emsp;" + user.displayName;
                    cell.appendChild(optionalElements);
                }
                else { // anonymous poster
                    var optionalElements = document.createElement('p');
                    optionalElements.className = 'posted-description';
    
                    optionalElements.innerHTML = optionalElements.innerHTML = "anonymous";;
                    cell.appendChild(optionalElements);
                }

                var tableTitle = document.createElement('a');
                tableTitle.setAttribute('href', doc.data().url);
                tableTitle.setAttribute('target', "_blank");
                tableTitle.innerHTML = doc.id;
                tableTitle.className = 'posted-title';
                cell.appendChild(tableTitle); // adds project title
                var tableDesc = document.createElement('p');
                tableDesc.innerHTML = doc.data().description;
                tableDesc.className = 'posted-description';
                cell.appendChild(tableDesc); // adds project description 
            }
        });
    }); // end adding to db - user's entries



    // specific search
    if(filter == document.getElementById("searchbar").value){
        filter = filter.toLowerCase();
        db.collection("demo-samples").get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc);
                if(doc.data().categories.includes(filter) || doc.id.toLowerCase().includes(filter) || doc.data().description.toLowerCase().includes(filter)){
                    table = document.getElementById("project-table");
                    // add website
                    var frameHolder = document.createElement('div');
                    frameHolder.setAttribute('class', 'frame-holder');
                    var ifrm = document.createElement('iframe');
                    ifrm.setAttribute('id', 'ifrm'); // assign an id
                    ifrm.setAttribute('class', 'website');
                    ifrm.setAttribute('src', doc.data().url);
                    var cell = document.getElementById("row").insertCell(0);
                    frameHolder.appendChild(ifrm);
                    cell.appendChild(frameHolder); // adds iframe into cell
    
                    // add optional email/github
                    optional =  doc.data().optional;
                    if(optional.length == 1){
                        var optionalElements = document.createElement('p');
                        optionalElements.className = 'posted-description';
                        if(optional[0] == 'email'){
                            optionalElements.innerHTML = user.email;
                            cell.appendChild(optionalElements);
                        }
                        else if(optional[0] == 'github'){
                            optionalElements.innerHTML = user.displayName;
                            cell.appendChild(optionalElements);
                        }
                    }
                    else if(optional.length == 2){
                        var optionalElements = document.createElement('p');
                        optionalElements.className = 'posted-description';
        
                        optionalElements.innerHTML = user.email + "&emsp;&emsp;" + user.displayName;
                        cell.appendChild(optionalElements);
                    }
                    else { // anonymous poster
                        var optionalElements = document.createElement('p');
                        optionalElements.className = 'posted-description';
        
                        optionalElements.innerHTML = optionalElements.innerHTML = "anonymous";;
                        cell.appendChild(optionalElements);
                    }
    
                    var tableTitle = document.createElement('a');
                    tableTitle.setAttribute('href', doc.data().url);
                    tableTitle.setAttribute('target', "_blank");
                    tableTitle.innerHTML = doc.id;
                    tableTitle.className = 'posted-title';
                    cell.appendChild(tableTitle); // adds project title
                    var tableDesc = document.createElement('p');
                    tableDesc.innerHTML = doc.data().description;
                    tableDesc.className = 'posted-description';
                    cell.appendChild(tableDesc); // adds project description 
                }
            });
        }); // end adding to db - demo samples
    }

}// end filterProjects()

function randomProject(){
    var randomUrl = [];
    db.collection("demo-samples").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            randomUrl.push(doc.data().url);
        })
    })
    db.collection(user.email).get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            randomUrl.push(doc.data().url);
        })
    })
    setTimeout(() => {
        url = randomUrl[Math.floor(Math.random() * randomUrl.length)]
        window.open(url);
    }, 500);
}