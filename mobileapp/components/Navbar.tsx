import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const Navbar = () => {
  return (
    <View style={styles.container}>
      {/* Left side items */}
      <View style={styles.leftContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Đặt lịch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Service</Text>
        </TouchableOpacity>
      </View>

      {/* Center item */}
      <View style={styles.centerContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.centerText}>Trang chủ</Text>
        </TouchableOpacity>
      </View>

      {/* Right side items */}
      <View style={styles.rightContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Cẩm nang</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Người dùng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 60, // Or any desired height
    flexDirection: "row", // Align items horizontally
    justifyContent: "space-between", // Distribute space evenly
    alignItems: "center", // Center items vertically
    paddingHorizontal: 10,
    backgroundColor: "#f8f8f8", // Light gray background
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
    elevation: 2, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  leftContainer: {
    flex: 1, // Takes up 1 part of the space
    flexDirection: "row",
    justifyContent: "flex-start", // Align items to the left
    alignItems: "center",
    gap: 15, // Space between items
  },
  centerContainer: {
    flex: 1, // Takes up 1 part of the space
    justifyContent: "center",
    alignItems: "center",
  },
  rightContainer: {
    flex: 1, // Takes up 1 part of the space
    flexDirection: "row",
    justifyContent: "flex-end", // Align items to the right
    alignItems: "center",
    gap: 15,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  centerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF", // A different color to stand out
  },
});

export default Navbar;
2;
