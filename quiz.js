const { data } = require('./data.md');

function adminQuizList(authUserId) {
    let quizList = {};
    let i = 0;
    let j = 0;
    
    if (data.user[i] == null) {
        return {
            error: 'There are no quizzes owned by this user',
        }
    }
    
}

console.log(adminQuizList(1));


function adminQuizCreate(authUserId, name, description) {
    let i = 0;
    let validAuth = false;
    while (data.user[i] != null) {
        if (data.user[i].userId === authUserId) {
            validAuth = true;
        }
        i++;
    }
    if (validAuth == false) {
        return {
            error: 'There is no author by that ID'
        }
    }

    let j = 0;
    while (data.user[j] != null) {
        j++;
    }

    return {
        quizId: data.quizzes[i].quizId
    }   
}

function adminQuizRemove(authUserId, quizId) {
    let i = 0;
    while (data.user[i].authUserId != null) {
        if (quizId === data.quizzes[i].quizId) {
            /* remove */
        }
    }
    
    return {}
}