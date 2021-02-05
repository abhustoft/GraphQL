import 'dotenv/config';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import {ApolloServer, gql} from 'apollo-server-express';

// *************************************************************
const userCredentials = {firstname: 'Robin'};
const userDetails = {nationality: 'German'};

const user = {
    ...userCredentials,
    ...userDetails,
};

console.log(user);
console.log(process.env.TERM_PROGRAM);
// *************************************************************

const app = express();
app.use(cors());

const schema = gql`
  type Query {
    users: [User!]
    me: User
    user(id: ID!): User
    
    messages: [Message!]!
    message(id: ID!): Message!
  }
  
  type Mutation {
    createMessage(text: String!): Message!    
    createOnMessage(text: String!, personId: String!): Message!    
    deleteMessage(id: ID!): Boolean!
  }
 
  type User {
    id: ID!
    username: String!
    last: String!
    messages: [Message!]
  }
  
  type Message {
    id: ID!
    text: String!
    user: User!
  }
`;

let users = {
    1: {
        id: '1',
        username: 'Robin Wieruch',
        last: ' Wieruch',
        messageIds: [1],
    },
    2: {
        id: '2',
        username: 'Dave Davids',
        last: 'Davids',
        messageIds: [2, 3],
    },
};

const occupation = {
    1: 'carpenter',
    2: 'plumber',
};

let messages = {
    1: {
        id: '1',
        text: 'Hello World',
        userId: '1',
    },
    2: {
        id: '2',
        text: 'By World',
        userId: '2',
    },
    3: {
        id: '3',
        text: 'the third',
        userId: '2',
    },
};
//const me = users[1];
const resolvers = {
    Query: {
        me: (parent, args, {me}) => {
            return me;
        },
        user: (parent, {id}) => {
            return users[id];
        },
        users: () => {
            return Object.values(users);
        },
        messages: () => {
            return Object.values(messages);
        },
        message: (parent, { id }) => {
            return messages[id];
        },
    },

    Mutation: {
        createMessage: (parent, { text }, { me }) => {
            const id = uuidv4();
            const message = {
                text,
                userId: me.id,
            };

            messages[id] = message;
            users[me.id].messageIds.push(id);

            return message;
        },

        createOnMessage: (parent, { text }, { personId }) => {
            const id = uuidv4();
            const message = {
                text,
                userId: personId,
            };

            messages[id] = message;
            users["2"].messageIds.push(id);

            return message;
        },

        deleteMessage: (parent, { id }) => {
            const { [id]: message, ...otherMessages } = messages;

            if (!message) {
                return false;
            }

            messages = otherMessages;

            return true;
        },
    },

    User: {
        username: user => {
            return `${user.username} ${user.id} ${occupation[user.id]}`;
        },
        messages: user => {
            return Object.values(messages).filter(
                message => message.userId === user.id,
            );
        },
    },
    Message: {
        user: (parent) => {
            return users[parent.userId];
        },
    },
};

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: {
        me: users[1],
    },
});

server.applyMiddleware({app, path: '/graphql'});

app.listen({port: 8000}, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
});
