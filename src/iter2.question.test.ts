test('expect 2', () => {
  expect(1 + 1).toStrictEqual(2);
});

// This needs to be updated to iter 3
// BEGINNING OF QUIZ QUESTION DUPLICATE
/*
  describe('Testing POST /v1/admin/quiz/{quizid}/question/{questionid}/duplicate', () => {

    test('Checking for a valid quiz question duplication', () => {

      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: {
          email: 'aaa@bbb.com',
          password: 'abcde12345',
          nameFirst: 'Michael',
          nameLast: 'Hourn'
        }
      });

      expect(AuthRegisterResponse.statusCode).toStrictEqual(200);
      const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
      const AuthUserId = AuthRegisterJSON.token;
      //Now have to create a quiz using the UserId
      let AdminQuizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
      { json: { token: AuthRegisterJSON.token, name: 'Question 1',
      description: "A description of my quiz"}});
      expect(AdminQuizCreateResponse.statusCode).toStrictEqual(200);
      const AdminQuizCreateJSON = JSON.parse(AdminQuizCreateResponse.body.toString());
      const AdminQuizId = AdminQuizCreateJSON.quizId;

      let QuizObject = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: "Prince Charles",
            correct: true
          }
        ]
      }

      let AdminQuizQuestionCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizId}/question`,
      { json: { token: AuthRegisterJSON.token, questionBody: QuizObject}});

      expect(AdminQuizQuestionCreateResponse.statusCode).toStrictEqual(200);
      const AdminQuizQuestionCreateJSON = JSON.parse(AdminQuizQuestionCreateResponse.body.toString());

      const QuestionId = AdminQuizQuestionCreateJSON.questionId;

      //Actual Testing bit (Rest above is setup for function call)
      let AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
      { json: { quizId: AdminQuizId, questionId: QuestionId, token: AuthUserId}});

      expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(200);
      let AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

      expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({newQuestionId: expect.any(Number)})

      //Going to pass invalid QuestionID

      AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
      { json: { quizId: AdminQuizId, questionId: -1, token: AuthUserId}});

      expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(400);
      AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

      expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({error: expect.any(String)});

      //Going provide invalid Quizid

      AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
      { json: { quizId: -1, questionId: QuestionId, token: AuthUserId}});

      expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(403);
      AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

      expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({error: expect.any(String)});

      //Going to give invalid Owner of Quiz's ID

      const AuthRegisterResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: {
          email: 'aaa1@bbb.com',
          password: 'abcde12345',
          nameFirst: 'Michael',
          nameLast: 'Hourn'
        }
      });

      expect(AuthRegisterResponse2.statusCode).toStrictEqual(200);
      const AuthRegisterJSON2 = JSON.parse(AuthRegisterResponse2.body.toString());
      const AnotherOwnerId = AuthRegisterJSON2.token;

      AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
      { json: { quizId: AnotherOwnerId, questionId: QuestionId, token: AuthUserId}});

      expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(403);
      AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

      expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({error: expect.any(String)})

      //Logging Out User
      const AuthLogoutResponse = request('POST', `${SERVER_URL}/v1/admin/auth/logout`,
      { json: { token: AuthRegisterJSON.token }});
      expect(AuthLogoutResponse.statusCode).toStrictEqual(200);

      //Checking for If the user is logged out
      AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
      { json: { quizId: AdminQuizId, questionId: QuestionId, token: AuthUserId}});

      expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(401);
      AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

      expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({error: expect.any(String)})
    });

  });
  */
