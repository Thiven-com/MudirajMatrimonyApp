import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SelectField({
  icon,
  placeholder = "Select an option",
  value = "",
  options = [],
  onSelect,
  title,
  compact = false,
  searchable,
  disabled = false,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const modalTitle = title || placeholder;
  const isSearchable =
    searchable !== undefined ? searchable : options.length > 7;

  // Normalize options array
  const formattedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { label: opt, value: opt };
      }
      return opt;
    });
  }, [options]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return formattedOptions;
    const query = searchQuery.toLowerCase().trim();
    return formattedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(query)
    );
  }, [formattedOptions, searchQuery]);

  const handleOpen = () => {
    if (disabled) return;
    setSearchQuery("");
    setModalVisible(true);
  };

  const handleSelect = (itemValue) => {
    if (onSelect) {
      onSelect(itemValue);
    }
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.selectRow, compact && styles.selectRowCompact]}
        activeOpacity={0.7}
        onPress={handleOpen}
        disabled={disabled}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={17}
            color={Colors.primaryRed}
            style={styles.inputIcon}
          />
        )}
        <Text
          style={[styles.selectText, value ? styles.selectTextFilled : null]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={15} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Dropdown Options Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.modalContent}>
            {/* Drag Handle Indicator */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {modalTitle}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Input (for long lists) */}
            {isSearchable && (
              <View style={styles.searchRow}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={Colors.textMuted}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${modalTitle.toLowerCase()}...`}
                  placeholderTextColor={Colors.placeholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && Platform.OS !== "ios" && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={Colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = value === item.value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={Colors.primaryRed}
                      />
                    ) : (
                      <View style={styles.radioUnchecked} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons
                    name="search-outline"
                    size={32}
                    color={Colors.placeholder}
                  />
                  <Text style={styles.emptyText}>No matching options found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  selectRowCompact: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  selectText: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.placeholder,
  },
  selectTextFilled: {
    color: Colors.textPrimary,
    fontFamily: Fonts.body.medium,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.75,
    minHeight: SCREEN_HEIGHT * 0.35,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 2,
  },
  optionItemSelected: {
    backgroundColor: "#FDF2F2",
  },
  optionText: {
    fontSize: 14.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  optionTextSelected: {
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  radioUnchecked: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
});
