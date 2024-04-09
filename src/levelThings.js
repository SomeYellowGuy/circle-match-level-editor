const levelThings = {
    /**
     * All possible goal types of a level.
     */
    goals:
    `Score,Button,Globe,Paint,
    Red Circle,Orange Circle,Yellow Circle,Green Circle,Blue Circle,Purple Circle,Black Circle,
    Striped Circle,Radial Circle,Rainbow Circle,
    Metal Ball (L),Watermelon (L),Donut (L),Jawbreaker`.split(","),

    /**
     * All possible types of a cannon of a level.
     */
    cannonTypes:
    `Watermelon,Globe,Vertical Striped Circle,Horizontal Striped Circle,Radial Circle,Extra Time Circle`.split(",")
}

export default levelThings;