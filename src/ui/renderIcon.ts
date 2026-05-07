import { h } from "vue";

export const renderIcon = (icon: any) => {
  return () => {
    return h(icon, { class: "h-4 w-4" }, {});
  };
};
