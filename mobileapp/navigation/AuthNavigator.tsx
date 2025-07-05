// navigation/AuthNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/authScreens/LoginScreen";
import MainAppContent from "../MainAppContent";
import TestTakerList from "../screens/customerScreens/test-taker/TestTakerList";
import AddTestTaker from "../screens/customerScreens/test-taker/AddTestTaker";
import TestTakerDetail from "../screens/customerScreens/test-taker/TestTakerDetail";
import Profile from "../screens/customerScreens/Profile";
// import RegisterScreen from "../screens/authScreens/RegisterScreen";

// Định nghĩa kiểu cho Stack Navigator trong phần Auth
export type AuthStackParamList = {
  Login: undefined;
  // Register: undefined;
  MainAppContent: undefined;
  TestTakerList: undefined;
  AddTestTaker: undefined;
  TestTakerDetail: undefined;
  Profile: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Login" // Đảm bảo ứng dụng bắt đầu từ màn hình Login
      screenOptions={{
        headerShown: false, // Ẩn header mặc định của Stack Navigator
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      {/* <AuthStack.Screen name="Register" component={RegisterScreen} /> */}
      <AuthStack.Screen
        name="MainAppContent"
        component={MainAppContent}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen name="Profile" component={Profile} />
      <AuthStack.Screen name="TestTakerList" component={TestTakerList} />
      <AuthStack.Screen name="AddTestTaker" component={AddTestTaker} />
      <AuthStack.Screen name="TestTakerDetail" component={TestTakerDetail} />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
