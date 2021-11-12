import Image from 'next/image'

export default function profilePic() {
    return (
        <Image src="/images/profile.jpg" height={144} width={144} alt="Profile Pic" />
    )
}