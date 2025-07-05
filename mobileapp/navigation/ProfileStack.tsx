import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Profile from "../screens/customerScreens/Profile";
import TestTakerList from "../screens/customerScreens/test-taker/TestTakerList";
import TestTakerDetail from "../screens/customerScreens/test-taker/TestTakerDetail";
import AddTestTaker from "../screens/customerScreens/test-taker/AddTestTaker";
// import AddTestTaker from "../screens/customerScreens/AddTestTaker";
// import EditTestTaker from "../screens/customerScreens/EditTestTaker";

const Stack = createStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={Profile} />
      <Stack.Screen name="TestTakerList" component={TestTakerList} />
      <Stack.Screen name="AddTestTaker" component={AddTestTaker} />
      <Stack.Screen name="TestTakerDetail" component={TestTakerDetail} />

      {/* <Stack.Screen name="EditTestTaker" component={EditTestTaker} /> */}
    </Stack.Navigator>
  );
}
