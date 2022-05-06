import React from "react";
import { TouchableOpacity, Image } from "react-native";
import { bottomArrow } from "~/assets/icons";

const BottomArrowIcon = () => {

    return (
        <TouchableOpacity onPress={() => console.log('필터')}>
            <Image
                source={bottomArrow}
                resizeMode="contain"
                style={{ width: 18, height: 8 }}
            />
        </TouchableOpacity>
    );
};

export default BottomArrowIcon;