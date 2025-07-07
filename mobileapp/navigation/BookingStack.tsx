import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AtHomeRegistration from "../screens/customerScreens/booking/AtHomeRegistration";
import RegisterServiceAtHome from "../screens/customerScreens/booking/RegisterServiceAtHome";

const Stack = createStackNavigator();

export default function BookingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AtHomeRegistration" component={AtHomeRegistration} />
      <Stack.Screen
        name="RegisterServiceAtHome"
        component={RegisterServiceAtHome}
      />

      {/* <Stack.Screen name="EditTestTaker" component={EditTestTaker} /> */}
    </Stack.Navigator>
  );
}
