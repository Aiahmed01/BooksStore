const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-password')
          .populate('savedBooks');

        return userData;
      }

      throw new AuthenticationError('You are not logged in');
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Can\'t find this user');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Wrong password');
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });

      if (!user) {
        throw new AuthenticationError('Something went wrong');
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { bookInput }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: bookInput } },
          { new: true, runValidators: true }
        )
        .populate('savedBooks');
        
        return updatedUser;
      }

      throw new AuthenticationError('You must be logged in to perform this action');
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        )
        .populate('savedBooks');
        
        return updatedUser;
      }

      throw new AuthenticationError('You must be logged in to perform this action');
    },
  },
};

module.exports = resolvers;
