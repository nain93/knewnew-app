import React from "react";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, Image } from "react-native";
import { close } from "~/assets/icons";

const CloseIcon = () => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity>
            <Image
                source={close}
                resizeMode="contain"
                style={{ width: 24, height: 24, marginLeft: 20 }}
            />
        </TouchableOpacity>
    );
};

export default CloseIcon;